import { WorkflowDescriptor, WorkflowItemDescriptor, WorkflowParameter, WorkflowParameterType } from "../../../../decorators";
import { FileTransformationContext } from "../../../../types";
import { StringBuilderClass } from "../../../../utilities/stringBuilder";

/**
 * This will print the workflow in XML format
 *
 * This is called when we are working with a `wf.ts` file
 */
export function printWorkflowXml(workflow: WorkflowDescriptor, context: FileTransformationContext): string {
	console.log(`Printing workflow ${workflow.name}...`);
	console.log(workflow);
	const stringBuilder = new StringBuilderClass("", "");
	stringBuilder.append(`<?xml version="1.0" encoding="utf-8" ?>`).appendLine();
	stringBuilder.append(`<workflow`
		+ ` xmlns="http://vmware.com/vco/workflow"`
		+ ` xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`
		+ ` xsi:schemaLocation="http://vmware.com/vco/workflow http://vmware.com/vco/workflow/Workflow-v4.xsd"`
		+ ` root-name="item1"`
		+ ` object-name="workflow:name=generic"`
		+ ` id="${workflow.id}"`
		+ ` version="${workflow.version}"`
		+ ` api-version="6.0.0"`
		+ ` restartMode="1"`
		+ ` resumeFromFailedMode="0"`
		+ `>`).appendLine();
	stringBuilder.indent();
	stringBuilder.append(`<display-name><![CDATA[${workflow.name}]]></display-name>`).appendLine();
	if (workflow.description) {
		stringBuilder.append(`<description><![CDATA[${workflow.description}]]></description>`).appendLine();
	}
	stringBuilder.append(`<position x="105" y="45.90909090909091" />`).appendLine();
	buildParameters("input", workflow.parameters.filter(p => !p.isAttribute && p.parameterType & WorkflowParameterType.Input));
	buildParameters("output", workflow.parameters.filter(p => !p.isAttribute && p.parameterType & WorkflowParameterType.Output));
	buildAttributes(workflow.parameters.filter(p => p.isAttribute));
	buildEndItem();
	workflow.items.forEach((item, i) => buildItem(item, i + 1));
	buildPresentation();
	stringBuilder.unindent();
	stringBuilder.append(`</workflow>`).appendLine();
	return stringBuilder.toString();

	function buildParameters(parentName: string, parameters: WorkflowParameter[]): void {
		if (parameters.length) {
			stringBuilder.append(`<${parentName}>`).appendLine();
			stringBuilder.indent();
			parameters.forEach(param => {
				if (!param.description) {
					stringBuilder.append(`<param name="${param.name}" type="${param.type}" />`).appendLine();
				} else {
					stringBuilder.append(`<param name="${param.name}" type="${param.type}">`).appendLine();
					stringBuilder.indent();
					stringBuilder.append(`<description><![CDATA[${param.description}]]></description>`).appendLine();
					stringBuilder.unindent();
					stringBuilder.append(`</param>`).appendLine();
				}
			});
			stringBuilder.unindent();
			stringBuilder.append(`</${parentName}>`).appendLine();
		}
	}

	function buildAttributes(attributes: WorkflowParameter[]): void {
		attributes.forEach(att => {
			stringBuilder.append(`<attrib name="${att.name}" type="${att.type}" read-only="false"`);
			buildBindAttribute(att);
			stringBuilder.append(` />`).appendLine();
		});
	}

	function buildBindAttribute(att: WorkflowParameter) {
		let value = "" + att.defaultValue;
		if (att.bind) {
			const index = value.lastIndexOf("/");
			if (index == -1) {
				throw new Error(`Invalid syntax for attribute "${att.name}" in workflow "${workflow.name}". It is specified that this value is bound to a Configuration (Elemene) but its value "${value}" `
					+ `cannot be mapped to a Configuraiton Element path. No / separator in value. Expected formaat is "/Path/To/Confif/variable".`);
			}
			if (index >= value.length - 1) {
				throw new Error(`Invalid syntax for attribute "${att.name}" in workflow "${workflow.name}". It is specified that this value is bound to a Configuration (Elemene) `
					+ `but its value "${value}" ends in / character. Expected formaat is "/Path/To/Confif/variable".`);
			}
			const key = value.substring(index + 1).trim();
			const path = value.substring(0, index).trim();
			const id = context.configIdsMap[path];
			if (id === null) {
				throw new Error(`Invalid syntax for attribute "${att.name}" in workflow "${workflow.name}". It is specified that its value is bound to configuration element with path "${path}" and variable "${key}"`
					+ `, but a configuration element with path "${path}" cannot be found in project at that stage. If you belive it is indeed really part of the project, `
					+ `please try moving the file earlier alphabetically so it is processed earlier than the workflow that uses it. Currently available configuration elements are: `
					+ JSON.stringify(context.configIdsMap));
			}
			stringBuilder.append(` conf-id="${id}" `);
			stringBuilder.append(` conf-key="${key}" `);
			value = "";
		}
	}

	function buildEndItem() {
		stringBuilder.append(`<workflow-item name="item0" type="end" end-mode="0">`).appendLine();
		stringBuilder.indent();
		stringBuilder.append(`<position x="${265 + 160 * workflow.items.length}.0" y="45.40909090909091" />`).appendLine();
		stringBuilder.unindent();
		stringBuilder.append(`</workflow-item>`).appendLine();
	}

	function buildItem(item: WorkflowItemDescriptor, pos: number): void {
		stringBuilder.append(`<workflow-item`
			+ ` name="item${pos}"`
			+ ` out-name="${pos < workflow.items.length ? `item${pos + 1}` : "item0"}"`
			+ ` type="task"`
			+ ">").appendLine();
		stringBuilder.indent();
		stringBuilder.append(`<display-name><![CDATA[${item.name}]]></display-name>`).appendLine();
		stringBuilder.append(`<script encoded="false"><![CDATA[${item.sourceText}]]></script>`).appendLine();
		buildItemParameterBindings("in-binding", item.input);
		buildItemParameterBindings("out-binding", item.output);
		stringBuilder.append(`<position x="${225 + 160 * (pos - 1)}.0" y="55.40909090909091" />`).appendLine();
		stringBuilder.unindent();
		stringBuilder.append(`</workflow-item>`).appendLine();
	}

	function buildItemParameterBindings(parentName: string, parameters: string[]): void {
		if (parameters.length) {
			stringBuilder.append(`<${parentName}>`).appendLine();
			stringBuilder.indent();
			parameters.forEach(paramName => {
				const param = workflow.parameters.find(p => p.name === paramName);
				if (param) {
					stringBuilder.append(`<bind name="${param.name}" type="${param.type}" export-name="${param.name}" />`).appendLine();
				}
			});
			stringBuilder.unindent();
			stringBuilder.append(`</${parentName}>`).appendLine();
		}
	}

	function buildPresentation(): void {
		if (workflow.presentation) {
			stringBuilder.append(workflow.presentation);
		}
		else {
			const inputParameters = workflow.parameters.filter(p => p.parameterType === WorkflowParameterType.Input);
			if (inputParameters.length) {
				stringBuilder.append(`<presentation>`).appendLine();
				stringBuilder.indent();

				inputParameters.forEach(param => {
					stringBuilder.append(`<p-param name="${param.name}">`).appendLine();
					stringBuilder.indent();
					stringBuilder.append(`<desc><![CDATA[${param.title || param.name}]]></desc>`).appendLine();

					if (param.required) {
						stringBuilder.append(`<p-qual kind="static" name="mandatory" type="boolean"><![CDATA[true]]></p-qual>`).appendLine();
					}

					if (param.multiLine) {
						stringBuilder.append(`<p-qual kind="static" name="textInput" type="void" />`).appendLine();
					}

					if (param.minStringLength != null) {
						stringBuilder.append(`<p-qual kind="static" name="minStringLength" type="Number"><![CDATA[${param.minStringLength.toString()}]]></p-qual>`).appendLine();
					}

					if (param.maxStringLength != null) {
						stringBuilder.append(`<p-qual kind="static" name="maxStringLength" type="Number"><![CDATA[${param.maxStringLength.toString()}]]></p-qual>`).appendLine();
					}

					if (param.numberFormat != null) {
						stringBuilder.append(`<p-qual kind="static" name="numberFormat" type="String"><![CDATA[${param.numberFormat}]]></p-qual>`).appendLine();
					}

					if (param.defaultValue != null) {
						stringBuilder.append(`<p-qual kind="static" name="defaultValue" type="${param.type}"><![CDATA[${param.defaultValue}]]></p-qual>`).appendLine();
					}

					if (param.availableValues != null && param.availableValues.length) {
						const availableValuesToken = `#{${param.availableValues.map(v => `#${param.type}#${v}#`).join(";")}}#`;
						stringBuilder.append(`<p-qual kind="static" name="genericEnumeration" type="Array/${param.type}"><![CDATA[${availableValuesToken}]]></p-qual>`).appendLine();
					}

					stringBuilder.unindent();
					stringBuilder.append(`</p-param>`).appendLine();
				});

				stringBuilder.unindent();
				stringBuilder.append(`</presentation>`).appendLine();
			}
		}
	}
}
