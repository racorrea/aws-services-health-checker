#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsServicesHealthCheckerStack } from '../lib/stack';

const app = new cdk.App();
new AwsServicesHealthCheckerStack(app, 'AwsServicesHealthCheckerStack', {});