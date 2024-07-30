[//]: # (VERSION_PLACEHOLDER DO NOT DELETE)
[//]: # (Used when working on a new release. Placed together with the Version.md)
[//]: # (Nothing here is optional. If a step must not be performed, it must be said so)
[//]: # (Do not fill the version, it will be done automatically)
[//]: # (Quick Intro to what is the focus of this release)

## Breaking Changes

[//]: # (### *Breaking Change*)
[//]: # (Describe the breaking change AND explain how to resolve it)
[//]: # (You can utilize internal links /e.g. link to the upgrade procedure, link to the improvement|deprecation that introduced this/)

## Deprecations

[//]: # (### *Deprecation*)
[//]: # (Explain what is deprecated and suggest alternatives)

[//]: # (Features -> New Functionality)

## Features

[//]: # (### *Feature Name*)
[//]: # (Describe the feature)
[//]: # (Optional But higlhy recommended Specify *NONE* if missing)
[//]: # (#### Relevant Documentation:)

[//]: # (Improvements -> Bugfixes/hotfixes or general improvements)

### *New `WorkflowItem` decorator for Workflows

The new Decorator gives you the ability to specify a canvas item that calls a Workflow.

- `@WorkflowItem({target: "", linkedItem: "" })`
  - `target` - The name of the next in line item.
  - `linkedItem` - The ID of the workflow to call

In order to bind inputs and outputs, you do it with the `@In` and `@Out` decorators. This is the same way we do it for other items.

Example:

```typescript
import { Workflow, Out, In, Item, RootItem, DecisionItem, WaitingTimerItem, WorkflowItem } from "vrotsc-annotations";

@Workflow({
  name: "Example Waiting Timer",
  path: "VMware/PSCoE",
  attributes: {
    waitingTimer: {
      type: "Date"
    },
    counter: {
      type: "number"
    },
    first: {
      type: "number"
    },
    second: {
      type: "number"
    },
    result: {
      type: "number"
    }
  }
})
export class HandleNetworkConfigurationBackup {
  @DecisionItem({ target: "waitForEvent", else: "prepareItems" })
  public decisionElement(waitingTimer: Date) {
    return waitingTimer !== null;
  }

  @Item({ target: "callOtherWf" })
  public prepareItems(@In @Out first: number, @In @Out second: number) {
    first = 1;
    second = 2;
  }

  @WorkflowItem({
    target: "print",
    linkedItem: "9e4503db-cbaa-435a-9fad-144409c08df0"
  })
  public callOtherWf(@In first: number, @In second: number, @Out result: number) {
  }

  @Item({ target: "end" })
  public print(@In result: number) {
    System.log("Result: " + result);
  }

  @Item({ target: "decisionElement", exception: "" })
  public execute(@Out @In waitingTimer: Date, @Out @In counter: number): void {
    if (!counter) {
      counter = 0;
    }

    counter++;

    if (counter < 2) {
      const tt = Date.now() + 5 * 1000;
      waitingTimer = new Date(tt);
    } else {
      waitingTimer = null;
    }

    System.log("Counter: " + counter);
    System.log("Waiting Timer: " + waitingTimer);
  }

  @Item({ target: "execute", exception: "" })
  @RootItem()
  public start() {
    System.log("Starting workflow");
  }

  @WaitingTimerItem({ target: "execute" })
  public waitForEvent(@In waitingTimer: Date) {
  }
}
```

## Improvements

[//]: # (### *Improvement Name* )
[//]: # (Talk ONLY regarding the improvement)
[//]: # (Optional But higlhy recommended)
[//]: # (#### Previous Behavior)
[//]: # (Explain how it used to behave, regarding to the change)
[//]: # (Optional But higlhy recommended)
[//]: # (#### New Behavior)
[//]: # (Explain how it behaves now, regarding to the change)
[//]: # (Optional But higlhy recommended Specify *NONE* if missing)
[//]: # (#### Relevant Documentation:)

### *ABX archetype build issue, cannot compile*

Fixed an issue where the ABX archetype could not compile due to an old version of the `xmlbuilder2` package.

#### Previous Behavior

We were getting a build error when trying to compile the ABX archetype:

```log
info:    Error ts(1110) /root/vro/polyglot_test_project/node_modules/@types/node/crypto.d.ts (3569,17): Type expected.
info:    Error ts(1005) /root/vro/polyglot_test_project/node_modules/@types/node/events.d.ts (105,28): ',' expected.
...
info:    Error ts(1005) /root/vro/polyglot_test_project/node_modules/@types/node/util.d.ts (1763,26): ';' expected.
info:    Error ts(1128) /root/vro/polyglot_test_project/node_modules/@types/node/util.d.ts (1765,1): Declaration or statement expected.
info: Exit status: 1
info: Compilation complete
/root/vro/polyglot_test_project/node_modules/@vmware-pscoe/polyglotpkg/dist/strategies/nodejs.js:123
            throw new Error('Found compilation errors');
                  ^

Error: Found compilation errors
    at NodejsStrategy.compile (/root/vro/polyglot_test_project/node_modules/@vmware-pscoe/polyglotpkg/dist/strategies/nodejs.js:123:19)
    at NodejsStrategy.<anonymous> (/root/vro/polyglot_test_project/node_modules/@vmware-pscoe/polyglotpkg/dist/strategies/nodejs.js:52:18)
    at Generator.next (<anonymous>)
    at fulfilled (/root/vro/polyglot_test_project/node_modules/@vmware-pscoe/polyglotpkg/dist/strategies/nodejs.js:5:58)
[ERROR] Command execution failed.
org.apache.commons.exec.ExecuteException: Process exited with an error: 1 (Exit value: 1)
    at org.apache.commons.exec.DefaultExecutor.executeInternal (DefaultExecutor.java:404)
    at org.apache.commons.exec.DefaultExecutor.execute (DefaultExecutor.java:166)
...
    at java.util.concurrent.ThreadPoolExecutor.runWorker (ThreadPoolExecutor.java:1136)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run (ThreadPoolExecutor.java:635)
    at java.lang.Thread.run (Thread.java:840)
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
```

#### New Behavior

The ABX archetype now compiles successfully.

### Add missing classes to `o11n-plugin-aria` and add missing methods to the existing classes

#### Previous Behavior

Many classes are missing completely compared with vRO API and some existing classes were missing some methods

#### Current Behavior

The following classes were added to `o11n-plugin-aria`:

- VraInfrastructureClient
- VraCloudAccountService
- VraUpdateCloudAccountVsphereSpecification
- VraCloudAccountVsphereSpecification
- VraRegionSpecification
- VraCloudAccountVsphere
- VraCloudZoneService
- VraZone
- VraHref
- VraZoneSpecification
- VraTag
- VraDataCollectorService
- VraRequestService
- VraRequestTracker
  
The following missing methods were added to the exist classes:

- Class `VraHost`
  - `destroy`

#### Related issue

<https://github.com/vmware/build-tools-for-vmware-aria/issues/347>

## Upgrade procedure

[//]: # (Explain in details if something needs to be done)
