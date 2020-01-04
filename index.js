const aws = require('aws-sdk');
const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const taskDefinitionPath = core.getInput('task-definition-path', {
            required: true
        });

        const taskDefinition = core.getInput('task-definition', {
            required: true
        });

        const ecs = new aws.ECS({
            customUserAgent: 'amazon-ecs-download-task-definition-for-github-actions'
        });
        ecs.describeTaskDefinition({
            taskDefinition: taskDefinition
        }, function (err, data) {
            if (err) {
                throw new Error(`Fail to describe task definition: ${err.message}`);
            } else {
                const taskDefPath = path.isAbsolute(taskDefinitionPath) ?
                    taskDefinitionPath :
                    path.join(process.env.GITHUB_WORKSPACE, taskDefinitionPath);
                var taskDef = data.taskDefinition;
                delete taskDef.taskDefinitionArn;
                delete taskDef.revision;
                delete taskDef.status;
                delete taskDef.requiresAttributes;
                delete taskDef.compatibilities;
                fs.writeFile(taskDefPath, JSON.stringify(taskDef), 'utf8', function (err) {
                    if (err) {
                        throw new Error(`Fail to write task definition: ${err.message}`);
                    }
                    core.debug(`Downloaded task definition: ${taskDefPath}`);
                });
            }
        });
    } catch (error) {
        core.debug(error);
        core.debug(error.stack);
        core.setFailed(error.message);
    }
}

module.exports = run;

if (require.main === module) {
    run();
}