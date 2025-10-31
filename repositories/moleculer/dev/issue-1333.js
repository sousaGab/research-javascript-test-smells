const ServiceBroker = require("../src/service-broker");
const fs = require("fs");

const { ValidationError } = require("moleculer").Errors;
const Joi = require("joi");
const BaseValidator = require("moleculer").Validators.Base;

class JoiValidator extends BaseValidator {
	constructor() {
		super();
	}

	compile(schema) {
		return params => this.validate(params, schema);
	}

	validate(params, schema) {
		const res = schema.validate(params);
		if (res.error) throw new ValidationError(res.error.message, null, res.error.details);

		return true;
	}
}

const broker = new ServiceBroker({
	logLevel: "debug",
	tracking: {
		enabled: true
	},
	validator: new JoiValidator()
});

broker.createService({
	name: "test",
	actions: {
		hello: {
			params: {
				name: "string"
			},
			handler(ctx) {
				return this.broker.createService({
					name: `${ctx.params.name}-${ctx.params.id}`
				});
			}
		}
	}
});

broker
	.start()
	.then(async () => {
		const res = await broker.call("test.hello", { name: 123 });
	})
	.catch(err => {
		broker.logger.error(err);
		broker.stop();
	});
