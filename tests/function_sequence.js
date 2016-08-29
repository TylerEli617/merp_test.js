var SubjectTestJS = require("../index.js");

function FunctionSequence()
{
    this.FunctionSequenceTest = function(assert, print, testSetTimeout, deffer, makeTestCallback)
    {
        var progress = true;
        var progressIndex = 0;
        var progressSteps = [];
        progressSteps[0] = "";
        progressSteps[1] = "";
        progressSteps[2] = "";
        progressSteps[3] = "";
        progressSteps[4] = "";
        progressSteps[5] = "";
        progressSteps[6] = "";
        progressSteps[7] = "";
        progressSteps[8] = "";
        progressSteps[9] = "";

        function Progress(name)
        {
            progress = true;
            progressSteps[progressIndex] = name;
            progressIndex++;
        }

        function SubjectSuite()
        {
            Progress("new");

            this.setup = function(assert, print, testSetTimeout, deffer, makeTestCallback)
            {
                Progress("setup");
            };

            this.SubjectSuiteCase1 = function(assert, print, testSetTimeout, deffer, makeTestCallback)
            {
                Progress("testCase");
            };

            this.SubjectSuiteCase2 = function(assert, print, testSetTimeout, deffer, makeTestCallback)
            {
                Progress("testCase");
            };

            this.tearDown = function(assert, print, testSetTimeout, deffer, makeTestCallback)
            {
                Progress("tearDown");
            };
        }

        SubjectSuite.staticSetup = function(assert, print, testSetTimeout, deffer, makeTestCallback)
        {
            Progress("staticSetup");
        };

        SubjectSuite.testCases = [];
        SubjectSuite.testCases.push("SubjectSuiteCase1");
        SubjectSuite.testCases.push("SubjectSuiteCase2");

        SubjectSuite.staticTearDown = function(assert, print, testSetTimeout, deffer, makeTestCallback)
        {
            Progress("staticTearDown");
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
            if (progress)
            {
                progress = false;
                testSetTimeout(monitor, 0);
            }
            else
            {
                assert(progressSteps[0] == "staticSetup", "Static setup did not run.");
                assert(progressSteps[1] == "new", "Initialization did not run.");
                assert(progressSteps[2] == "setup", "Setup did not run.");
                assert(progressSteps[3] == "testCase", "Test case did not run.");
                assert(progressSteps[4] == "tearDown", "Tear down did not run.");
                assert(progressSteps[5] == "new", "Initialization did not run.");
                assert(progressSteps[6] == "setup", "Setup did not run.");
                assert(progressSteps[7] == "testCase", "Test case did not run.");
                assert(progressSteps[8] == "tearDown", "Tear down did not run.");
                assert(progressSteps[9] == "staticTearDown", "Static tear down did not run.");
                assert(progressIndex == 10, "There was more steps than expected.");
            }
        }

        SubjectTestJS.runTestSuites(SubjectSuites, function(){}, TestJSDone);
        testSetTimeout(monitor, 0);
    };
}

FunctionSequence.testCases = [];
FunctionSequence.testCases.push("FunctionSequenceTest");

FunctionSequence.name = "FunctionSequence";

module.exports = FunctionSequence;