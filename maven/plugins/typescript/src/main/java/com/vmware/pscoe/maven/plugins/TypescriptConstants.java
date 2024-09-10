/*
 * #%L
 * o11n-typescript-package-maven-plugin
 * %%
 * Copyright (C) 2023 VMware
 * %%
 * Build Tools for VMware Aria
 * Copyright 2023 VMware, Inc.
 * 
 * This product is licensed to you under the BSD-2 license (the "License"). You may not use this product except in compliance with the BSD-2 License.  
 * 
 * This product may include a number of subcomponents with separate copyright notices and license terms. Your use of these subcomponents is subject to the terms and conditions of the subcomponent's license, as noted in the LICENSE file.
 * #L%
 */
package com.vmware.pscoe.maven.plugins;

import java.nio.file.Paths;

public final class TypescriptConstants {

	public static final String OUT_ROOT_PATH = Paths.get("target", "vro-sources").toString();
	public static final String OUT_XML_ROOT_PATH = Paths.get(OUT_ROOT_PATH, "xml").toString();
	public static final String OUT_XML_SRC_PATH = Paths.get(OUT_XML_ROOT_PATH, "src", "main", "resources").toString();
	public static final String OUT_JS_ROOT_PATH = Paths.get(OUT_ROOT_PATH, "js").toString();
	public static final String OUT_JS_SRC_PATH = Paths.get(OUT_JS_ROOT_PATH, "src", "main", "resources").toString();
	public static final String OUT_TEST_HELPER_SRC_PATH = Paths.get(OUT_ROOT_PATH, "testHelpers", "src", "main", "resources").toString();
	public static final String OUT_TYPE_PATH = Paths.get("target", "vro-types").toString();

}
