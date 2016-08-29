function shuffle(array)
{
    var index = array.length;

    while (index !== 0)
    {
        var swapIndex = Math.floor(Math.random() * index);
        index--;
        var swapValue = array[swapIndex];
        array[swapIndex] = array[index];
        array[index] = swapValue;
    };
}

function getPrintAndLog(print, log)
{
    function printAndAppend(line)
    {
        print(line);
        log.push(line);
    }

    return printAndAppend;
}

function getAssert(print)
{
    function assert(guard, failMessage, passMessage)
    {
        if (typeof failMessage === "undefined")
        {
            failMessage = "FAIL";
        }

        if (typeof passMessage === "undefined")
        {
            passMessage = "";
        }

        if (guard)
        {
            if (passMessage !== "")
            {
                print(passMessage);
            }
        }
        else
        {
            print(String(failMessage));
            throw new Error(String(failMessage));
        }
    }

    return assert;
}

function Deffer(resume)
{
    function DefferHandle()
    {
        var handeResumed = false;

        this.resume = function()
        {
            if (handeResumed)
            {
                throw new Error("This deffer handle has already been resumed");
            }
            else
            {
                handeResumed = true;
                decrementDefferCount();
            }
        }
    }

    var resumed = false;

    var defferCount = 0;

    this.deffer = function()
    {
        if (resumed)
        {
            throw new Error("This deffer has already been resumed");
        }
        else
        {
            var handle = new DefferHandle();
            defferCount++;
            return handle;
        }
    }

    function attemptResume()
    {
        if (defferCount == 0)
        {
            if (!resumed)
            {
                resumed = true;
                resume();
            }
        }
    }

    function decrementDefferCount()
    {
        defferCount--;

        if (defferCount === 0)
        {
            setTimeout(attemptResume, 0);
        }
    }
}

function callTestFunction(testFunction, print, log, resumePass, resumeFail)
{
    var printAndLog = getPrintAndLog(print, log);
    var testAssert = getAssert(printAndLog);
    var continueTest = true;

    function resumePassWithGate()
    {
        if (continueTest)
        {
            resumePass.apply(this, arguments);
        }
    }

    var testDeffer = new Deffer(resumePassWithGate);

    function makeTestCallback(userCallback)
    {
        function testCallback()
        {
            if(continueTest)
            {
                try
                {
                    return userCallback.apply(this, arguments);
                }
                catch(error)
                {
                    resumeFail(error);
                    continueTest = false;
                }
            }
        }

        return testCallback;
    }

    function testSetTimeout(userCallback, timeout)
    {
        if (typeof userCallback !== 'function')
        {
            throw new Error("The callback is not a function");
        }

        var deffer = testDeffer.deffer();

        function callUserCallback()
        {
            deffer.resume();
            userCallback();
        }

        setTimeout(makeTestCallback(callUserCallback), timeout);
    }

    testDeffer.deffer().resume();

    if (typeof testFunction !== "undefined")
    {
        testFunction(testAssert, printAndLog, testSetTimeout, testDeffer, makeTestCallback);
    }
}

function runTestSuite(testSuite, print, testSuiteDone)
{
    var testSuiteResult = {
        name : testSuite.name,
        staticSetupLog : [],
        testCaseResults : [],
        passedTestCaseResults : [],
        failedTestCaseResults : [],
        staticTearDownLog : [],
        error : null,
        errorLocation : null,
    }

    function runTestCase(testCase, testCaseDone)
    {
        var instance = new testSuite();
        var testCaseResult = {
            name : "",
            setupLog : [],
            testCaseLog : [],
            tearDownLog : [],
            error : null,
            errorLocation : null,
        };

        if (typeof testCase !== "string")
        {
            testCaseResult.error = new Error("TestCases should be a list of strings, but a test case was of type " + typeof testCase);
            testCaseResult.errorLocation = "testType";
            testCaseDone(testCaseResult);
        }
        else
        {
            testCaseResult.name = testCase;
            print(testSuite.name + "." + testCase);
            callTestFunction(instance.setup, print, testCaseResult.setupLog, instanceSetupDone, errorInInstanceSetup);
        }

        function instanceSetupDone()
        {
            callTestFunction(instance[testCase], print, testCaseResult.testCaseLog, instanceTestCaseDone, errorInTestCase);
        }

        function errorInInstanceSetup(error)
        {
            testCaseResult.error = error;
            testCaseResult.errorLocation = "setup";
            testCaseDone(testCaseResult);
        }

        function instanceTestCaseDone()
        {
            callTestFunction(instance.tearDown, print, testCaseResult.tearDownLog, instanceTearDownDone, errorInInstanceTearDown);
        }

        function errorInTestCase(error)
        {
            testCaseResult.error = error;
            testCaseResult.errorLocation = "testCase";
            callTestFunction(instance.tearDown, print, testCaseResult.tearDownLog, instanceTearDownDone, errorInInstanceTearDown);
        }

        function instanceTearDownDone()
        {
            testCaseDone(testCaseResult);
        }

        function errorInInstanceTearDown(error)
        {
            if (testCaseResult.error === null)
            {
                testCaseResult.error = error;
                testCaseResult.errorLocation = "tearDown";
            }

            testCaseDone(testCaseResult);
        }
    }

    callTestFunction(testSuite.staticSetup, print, testSuiteResult.staticSetupLog, staticSetupDone, errorInStaticSetup);

    function staticSetupDone()
    {
        var testCasesCopy = testSuite.testCases.slice(0);
        shuffle(testCasesCopy);

        function runTestCases()
        {
            if (testCasesCopy.length == 0)
            {
                callTestFunction(testSuite.staticTearDown, print, testSuiteResult.staticTearDownLog, staticTearDownDone, errorInStaticTearDown);
            }
            else
            {
                runTestCase(testCasesCopy.shift(), reportAndRunNext);
            }
        }

        function reportAndRunNext(testCaseResult)
        {
            if (testCaseResult.error === null)
            {
                testSuiteResult.passedTestCaseResults.push(testCaseResult);
            }
            else
            {
                testSuiteResult.failedTestCaseResults.push(testCaseResult);
            }

            testSuiteResult.testCaseResults.push(testCaseResult);
            runTestCases();
        }

        runTestCases();
    }

    function errorInStaticSetup(error)
    {
        testSuiteResult.error = error;
        testSuiteResult.errorLocation = "staticSetup";
        testSuiteDone(testSuiteResult);
    }

    function staticTearDownDone()
    {
        testSuiteDone(testSuiteResult);
    }

    function errorInStaticTearDown(error)
    {
        testSuiteResult.error = error;
        testSuiteResult.errorLocation = "staticTearDown";
        testSuiteDone(testSuiteResult);
    }
}

function runTestSuites(testSuites, print, testSuitesDone)
{
    var testSuitesCopy = testSuites.slice(0);
    shuffle(testSuitesCopy);
    var testSuitesResult = {
        testSuiteResults : [],
        passedTestSuiteResults : [],
        failedTestSuiteResults : []
    }

    function runNextTestSuite()
    {
        if (testSuitesCopy.length === 0)
        {
            testSuitesDone(testSuitesResult);
        }
        else
        {
            runTestSuite(testSuitesCopy.shift(), print, reportAndRunNext);
        }
    }

    function reportAndRunNext(testSuiteResult)
    {
        if (testSuiteResult.failedTestCaseResults.length === 0)
        {
            testSuitesResult.passedTestSuiteResults.push(testSuiteResult);
        }
        else
        {
            testSuitesResult.failedTestSuiteResults.push(testSuiteResult);
        }

        testSuitesResult.testSuiteResults.push(testSuiteResult);
        runNextTestSuite();
    }

    setTimeout(runNextTestSuite, 0);
}

exports.runTestSuites = runTestSuites;
