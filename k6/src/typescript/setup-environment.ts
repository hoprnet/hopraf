import * as fs from 'fs';
import Handlebars from "handlebars";
import { HoprdNode } from './hoprd-node';
import { checkNodes, setupChannels } from './setup-tasks';

const setupEnvironment = async (nodes: HoprdNode[]) => {
  try {
    // Check nodes
    await checkNodes(nodes, 10)
    // Setup channels
    await setupChannels(nodes)  
  } catch (error) {
    console.error('Environment setup tasks failed:', error);
    throw error; // Re-throw to be caught by the Promise chain
  }
}

// Main
const clusterNodes = __ENV.K6_CLUSTER_NODES || "core";
const topologyName = process.env.K6_TOPOLOGY_NAME || 'many2many'
const workloadName = process.env.K6_WORKLOAD_NAME || 'sanity-check'
const testid = process.env.TESTID || 'kubernetes'
const requestsPerSecondPerVu = process.env.REQUESTS_PER_SECOND_PER_VU || 1
const duration = process.env.DURATION || "30"
const vuPerRoute = process.env.VU_PER_ROUTE || 1
const nodesData = JSON.parse(fs.readFileSync(`assets/nodes-${topologyName}.json`).toString())
const enabledNodes: HoprdNode[] = nodesData.nodes
  .filter((node: any) => node.enabled)
  .map(async (node: any) => {
  let hoprdNode = new HoprdNode(node);
  await hoprdNode.init();
  return hoprdNode;
});
nodesData.nodes.filter((node: any) => !node.enabled).forEach((node: any) => { console.log(`[INFO] Node ${node.name} is disabled`) })

Promise.all(enabledNodes).then((hoprdNodes: HoprdNode[]) => {
  setupEnvironment(hoprdNodes).then(() => {
    console.log('[INFO] Environment fully setup')

    // Generate k6 test run file
    const k6TestRunTemplateData = fs.readFileSync(`assets/k6-test-run.yaml`).toString()
    const k6TestRunTemplate = Handlebars.compile(k6TestRunTemplateData);
    const k6TestRunTemplateParsed = k6TestRunTemplate({ clusterNodes, topologyName, workloadName, requestsPerSecondPerVu, testid, duration, vuPerRoute });
    fs.writeFileSync(`./k6-test-run.yaml`, k6TestRunTemplateParsed)

    // Generate k6 test results file
    const k6TestResultsTemplateData = fs.readFileSync(`assets/k6-test-results.yaml`).toString()
    const k6TestResultsTemplate = Handlebars.compile(k6TestResultsTemplateData);
    const k6TestResultsTemplateParsed = k6TestResultsTemplate({ clusterNodes, topologyName, workloadName, requestsPerSecondPerVu, testid, duration });
    fs.writeFileSync(`./k6-test-results.yaml`, k6TestResultsTemplateParsed)

  }).catch((error) => {
    console.error('Failed to generate k6 manifest files:', error);
    console.error(error)
  });
})
