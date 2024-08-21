import { PolicyTemplate } from "vrotsc-annotations";

@PolicyTemplate({
	name: "Policy Template Amqp",
	path: "MyOrg/MyProject",
	type: "AMQP:Subscription",
	templateVersion: "v2",
	elements: {
		AMQPSubscription: {
			type: "AMQP:Subscription",
			events: {
				OnMessage: "onMessage"
			}
		}
	}
})
export class PolicyTemplateAmqp {
	onMessage(self: AMQPSubscription, event: any) {
		System.log("onMessage");
	}
}
