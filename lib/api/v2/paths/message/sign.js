import { default as original } from '../messages/sign.js';
/*
    Deprecated endpoint.
    Endpoint "/api/v2/messages/sign" should be used instead.
*/
const POST = [original.POST[0].bind({})];
POST.apiDoc = JSON.parse(JSON.stringify(original.POST.apiDoc));
POST.apiDoc.deprecated = true;
POST.apiDoc.operationId = 'messageSign';
export default { POST };
//# sourceMappingURL=sign.js.map