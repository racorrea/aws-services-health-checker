import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Function, Code } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsServicesHealthCheckerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const healthCheckLambda = new Function(this, 'HealthCheckLambda', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset('dist/health-checker/health-check-lambda.zip'),
      timeout: Duration.seconds(600),
    });

    const httpPermission = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resources: ['*'],
    });

    healthCheckLambda.addToRolePolicy(httpPermission);

    new LogGroup(this, 'HealthCheckLogGroup', {
      logGroupName: `/aws/lambda/${healthCheckLambda.functionName}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const rule = new Rule(this, 'HealthCheckRule', {
      schedule: Schedule.rate(Duration.minutes(60)),
    });

    rule.addTarget(new LambdaFunction(healthCheckLambda));
  }
}
