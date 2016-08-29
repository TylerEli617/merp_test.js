var SubjectTestJS = require("../index.js");

function FunctionAsync()
{
    this.FunctionAsyncTest = function(assert, print, testSetTimeout, deffer, makeTestCallback)
    {
        var currentFunction = "";
        var sequence = [];
        var sequenceIndex = 0;
        sequence[0] = "staticSetup";
        sequence[1] = "setup";
        sequence[2] = "testCase";
        sequence[3] = "tearDown";
        sequence[4] = "staticTearDown";
        
        function markFunction(name)
        {
            currentFunction = name;
        }

        function SubjectSuite()
        {
            this.setup = function(assert, print, testSetTimeout, deffer, makeTestCallback)
            {
                markFunction("setup");
            };

            this.SubjectSuiteCase = function(assert, print, testSetTimeout, deffer, makeTestCallback)
            {
                markFunction("testCase");
            };

            this.tearDown = function(assert, print, testSetTimeout, deffer, makeTestCallback)
            {
                markFunction("tearDown");
            };
        }

        SubjectSuite.staticSetup = function(assert, print, testSetTimeout, deffer, makeTestCallback)
        {
            markFunction("staticSetup");
        };

        SubjectSuite.testCases = [];
        SubjectSuite.testCases.push("SubjectSuiteCase");

        SubjectSuite.staticTearDown = function(assert, print, testSetTimeout, deffer, makeTestCallback)
        {
            markFunction("staticTearDown");
        };

        SubjectSuite.name = "SubjectSuite";

        var SubjectSuites = [];
        SubjectSuites.push(SubjectSuite);

        var testDoneLock = deffer.deffer();

        function TestJSDone()
        {
            testDoneLock.resume();
        }

        function monitor()
        {
            assert(currentFunction === sequence[sequenceIndex], "Expected " + sequence[sequenceIndex] + ", but at " + currentFunction);
            sequenceIndex++;
            
            if (sequenceIndex < 5)
            {
                testSetTimeout(monitor, 0);
            }
        }

        SubjectTestJS.runTestSuites(SubjectSuites, function(){}, TestJSDone);
        testSetTimeout(monitor, 0);
    };
}

FunctionAsync.testCases = [];
FunctionAsync.testCases.push("FunctionAsyncTest");

FunctionAsync.name = "FunctionAsync";

module.exports = FunctionAsync;