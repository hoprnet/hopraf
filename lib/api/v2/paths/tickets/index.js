import { STATUS_CODES } from '../../utils.js';
export var formatTicket = (ticket) => {
    return {
        counterparty: ticket.counterparty.to_hex(),
        challenge: ticket.challenge.to_hex(),
        epoch: ticket.epoch.to_string(),
        index: ticket.index.to_string(),
        amount: ticket.amount.to_string(),
        winProb: ticket.win_prob.to_string(),
        channelEpoch: ticket.channel_epoch.to_string(),
        signature: ticket.signature.to_hex()
    };
};
export const getAllTickets = async (node) => {
    const tickets = await node.getAllTickets();
    return tickets.map(formatTicket);
};
const GET = [
    async (req, res, _next) => {
        const { node } = req.context;
        try {
            const tickets = await getAllTickets(node);
            return res.status(200).send(tickets);
        }
        catch (err) {
            return res
                .status(422)
                .send({ status: STATUS_CODES.UNKNOWN_FAILURE, error: err instanceof Error ? err.message : 'Unknown error' });
        }
    }
];
// TODO: tickets missing param ???
GET.apiDoc = {
    description: 'Get all tickets earned by relaying data packets by your node from every channel.',
    tags: ['Tickets'],
    operationId: 'ticketsGetTickets',
    responses: {
        '200': {
            description: 'Tickets fetched successfully.',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Ticket'
                        }
                    }
                }
            }
        },
        '401': {
            $ref: '#/components/responses/Unauthorized'
        },
        '403': {
            $ref: '#/components/responses/Forbidden'
        },
        '422': {
            description: 'Unknown failure.',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', example: STATUS_CODES.UNKNOWN_FAILURE },
                            error: { type: 'string', example: 'Full error message.' }
                        }
                    },
                    example: { status: STATUS_CODES.UNKNOWN_FAILURE, error: 'Full error message.' }
                }
            }
        }
    }
};
export default { GET };
//# sourceMappingURL=index.js.map