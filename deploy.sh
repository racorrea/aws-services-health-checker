rm -rf dist && mkdir dist
cd src/functions/health-checker && npm ci && cd ../../..
cp -r src/functions/health-checker dist
cd dist/health-checker
zip -Dr health-check-lambda.zip *
cd ../../
cdk synth -q --profile XXX
cdk deploy --profile XXX
rm -rf dist

