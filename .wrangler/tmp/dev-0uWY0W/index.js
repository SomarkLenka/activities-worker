var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime3,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
var {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert: assert2,
  disconnect,
  mainModule
} = unenvProcess;
var {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/utils/spa.js
async function htmlPage(env2, submissionToken = null) {
  let submissionData = null;
  if (submissionToken) {
    const result = await env2.waivers.prepare(
      "SELECT submission_id, property_id, checkin_date, guest_name, guest_email, status, token_expires_at FROM submissions WHERE verification_token = ?"
    ).bind(submissionToken).first();
    if (result && result.status === "pending") {
      const expires = new Date(result.token_expires_at);
      if (expires > /* @__PURE__ */ new Date()) {
        submissionData = result;
      }
    }
  }
  const propertiesResult = await env2.waivers.prepare(
    "SELECT id, name FROM properties WHERE id != ? ORDER BY name"
  ).bind("default").all();
  const properties = propertiesResult.results || [];
  const propsData = [];
  for (const property of properties) {
    const activitiesResult = await env2.waivers.prepare(
      "SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label"
    ).bind(property.id).all();
    propsData.push({
      id: property.id,
      name: property.name,
      activities: activitiesResult.results || []
    });
  }
  const risksResult = await env2.waivers.prepare(
    "SELECT level, description FROM risk_descriptions"
  ).all();
  const risks = {};
  for (const row of risksResult.results || []) {
    risks[row.level] = { description: row.description };
  }
  const propsJSON = JSON.stringify(propsData);
  const props64 = btoa(unescape(encodeURIComponent(propsJSON)));
  const risksJSON = JSON.stringify(risks);
  const risks64 = btoa(unescape(encodeURIComponent(risksJSON)));
  const submissionJSON = submissionData ? JSON.stringify(submissionData) : "null";
  const submission64 = btoa(unescape(encodeURIComponent(submissionJSON)));
  return new Response(`
<!doctype html>
<html lang="en"><meta charset="utf-8">
<title>Activity Waiver</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:2rem 1rem;background:#f8fafc;color:#1e293b;line-height:1.6}
  .container{max-width:1200px;margin:0 auto;background:white;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);overflow:hidden}
  .header{background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);padding:2.5rem 2rem;color:white;text-align:center}
  .header h1{margin:0 0 0.5rem 0;font-size:2rem;font-weight:700}
  .header p{margin:0;opacity:0.9;font-size:1rem}
  .content{padding:2rem}
  .form-group{margin-bottom:1.5rem}
  .form-group label{display:block;margin-bottom:0.5rem;font-weight:600;font-size:0.875rem;color:#475569}
  .form-group input,.form-group select{width:100%;padding:0.75rem 1rem;border:1px solid #cbd5e1;border-radius:8px;font-size:1rem;transition:all 0.2s;max-width:400px}
  .form-group input:focus,.form-group select:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
  .section-title{font-size:1.25rem;font-weight:700;color:#0f172a;margin:2rem 0 1rem 0;padding-bottom:0.5rem;border-bottom:2px solid #e2e8f0}
  .activities-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;column-gap:24px;padding:0;overflow:hidden}
  .activity-row{display:flex;gap:8px;align-items:center}
  .activity-item{display:flex;align-items:center;padding:12px;background:#f8fafc;border-radius:10px;border:2px solid #e2e8f0;cursor:pointer;transition:all 0.2s;flex:1;position:relative;min-height:68px;overflow:hidden}
  .activity-item:hover{background:#f1f5f9;border-color:#3b82f6}
  .activity-item.checked{background:#eff6ff;border-color:#3b82f6}
  .activity-item input[type="checkbox"]{margin-right:10px;cursor:pointer;width:20px;height:20px;flex-shrink:0;accent-color:#3b82f6}
  .activity-item label{margin:0;cursor:pointer;flex:1;display:flex;align-items:center;gap:8px;position:relative;z-index:1;justify-content:space-between}
  .activity-label-text{white-space:nowrap;flex-shrink:0;min-width:120px;font-weight:600;color:#1e293b}
  .risk-chip-wrapper{display:flex;align-items:center;justify-content:flex-end;min-width:360px;width:360px;transition:all 0.3s ease;position:relative;overflow:visible;z-index:10}
  .risk-chip{padding:6px 14px;border-radius:12px;color:white;font-size:11px;font-weight:600;white-space:nowrap;display:inline-block;width:100px;text-align:center;box-sizing:border-box;flex-shrink:0;position:absolute;right:0;z-index:2}
  .risk-low{background:#10b981}
  .risk-medium{background:#f59e0b}
  .risk-high{background:#ef4444}
  .risk-details{position:absolute;right:110px;width:250px;opacity:0;font-size:9px;line-height:1.3;color:#334155;transition:opacity 0.3s ease;padding:4px 8px;display:block;box-sizing:border-box;max-height:56px;overflow-y:auto;background:white;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.1);white-space:normal}
  .risk-chip-wrapper:hover .risk-details{opacity:1}
  .activity-initial{width:70px;height:50px;text-align:center;padding:0;border:2px solid #cbd5e1;border-radius:8px;visibility:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;background:white;transition:all 0.2s}
  .activity-initial.visible{visibility:visible;border-color:#3b82f6}
  .activity-initial:focus{outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
  .acceptance-box{background:#fef3c7;border:2px solid #fbbf24;border-radius:10px;padding:1rem;margin:1.5rem 0;display:flex;align-items:center;gap:0.75rem;position:relative}
  .acceptance-box input[type="checkbox"]{width:20px;height:20px;accent-color:#f59e0b;cursor:pointer}
  .acceptance-box label{margin:0;font-weight:600;color:#78350f;cursor:pointer}
  .acceptance-box input[type="checkbox"]:disabled{cursor:not-allowed;opacity:0.5}
  .acceptance-box .tooltip{display:none;position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:#1e293b;color:white;padding:0.5rem 1rem;border-radius:6px;font-size:0.875rem;white-space:nowrap;margin-bottom:0.5rem;font-weight:400}
  .acceptance-box .tooltip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-top-color:#1e293b}
  .acceptance-box:has(input[type="checkbox"]:disabled):hover .tooltip{display:block}
  .signature-container{display:flex;flex-direction:column;align-items:center;gap:12px;padding:1.5rem;background:#f8fafc;border-radius:10px;border:2px solid #e2e8f0}
  canvas{border:2px dashed #cbd5e1;border-radius:8px;width:90%;max-width:600px;touch-action:none;display:block;background:white}
  button{font-weight:600;border:none;cursor:pointer;transition:all 0.2s;font-size:1rem;border-radius:8px;font-family:inherit}
  #clearSig{padding:0.625rem 1.5rem;background:#64748b;color:white}
  #clearSig:hover{background:#475569}
  #submit{width:100%;padding:1rem;background:#3b82f6;color:white;font-size:1.125rem;margin-top:1.5rem;max-width:400px}
  #submit:hover:not(:disabled){background:#2563eb}
  #submit:disabled{opacity:0.5;cursor:not-allowed}
  .thanks{padding:2rem;text-align:center}
  .thanks h2{color:#3b82f6;font-size:1.75rem;margin-bottom:1rem}
  .info-box{background:#eff6ff;border:2px solid #3b82f6;border-radius:10px;padding:1rem;margin-bottom:1.5rem}
  .info-box p{margin:0.25rem 0;color:#1e40af}
  @media (max-width:768px){
    .content{padding:1.5rem}
    .activities-grid{grid-template-columns:1fr}
    .form-group input,.form-group select{width:100%;max-width:100%}
    canvas{width:100%}
  }
</style>

<body>
  <div class="container">
    <div class="header">
      <h1>Activity Waiver</h1>
      <p id="headerSubtitle">Complete your waiver to get started</p>
    </div>

    <div class="content">
      <!-- Initial Info Form -->
      <form id="initialForm">
        <div class="form-group">
          <label>Property</label>
          <select id="prop" required></select>
        </div>

        <div class="form-group">
          <label>Check-in Date</label>
          <input type="date" id="date" required>
        </div>

        <div class="form-group">
          <label>Full Name</label>
          <input id="name" required>
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input id="email" type="email" required>
        </div>

        <button id="initialSubmit">Continue to Activities</button>
      </form>

      <!-- Activity Selection Form (hidden initially) -->
      <form id="activityForm" hidden>
        <div class="info-box" id="guestInfo"></div>

        <h3 class="section-title">Select Activities</h3>
        <div id="activities" class="activities-grid"></div>

        <div class="acceptance-box">
          <input id="master" type="checkbox" required>
          <label for="master">I have read and accept all risks</label>
          <span class="tooltip" id="masterTooltip">Please initial all selected activities first</span>
        </div>

        <h3 class="section-title">Signature</h3>
        <div class="signature-container">
          <canvas id="sign" width="600" height="200"></canvas>
          <button id="clearSig" type="button">Clear</button>
        </div>

        <button id="submit">Submit Waiver</button>
      </form>

      <div id="thanks" class="thanks" hidden></div>
    </div>
  </div>

<script type="module">
  /* ---------- bootstrap data -------------------- */
  let props = JSON.parse(atob('${props64}'));
  const risks = JSON.parse(atob('${risks64}'));
  const submission = JSON.parse(atob('${submission64}'));

  console.log("Props:", props);
  console.log("Risks:", risks);
  console.log("Submission:", submission);

  if (!Array.isArray(props)) {
    props = [props];
  }

  const propSel = document.getElementById('prop');
  if (!props || props.length === 0) {
    propSel.add(new Option('No properties available', ''));
    propSel.disabled = true;
  } else {
    props.forEach(p => propSel.add(new Option(p.name, p.id)));
  }

  /* ---------- Determine which form to show -------------------- */
  const initialForm = document.getElementById('initialForm');
  const activityForm = document.getElementById('activityForm');
  const headerSubtitle = document.getElementById('headerSubtitle');

  if (submission) {
    // Show activity form with pre-filled info
    initialForm.hidden = true;
    activityForm.hidden = false;
    headerSubtitle.textContent = 'Select your activities and sign';

    // Pre-fill property selection
    propSel.value = submission.property_id;
    propSel.disabled = true;

    // Show guest info
    document.getElementById('guestInfo').innerHTML =
      '<p><strong>Property:</strong> ' + props.find(p => p.id === submission.property_id)?.name + '</p>' +
      '<p><strong>Check-in:</strong> ' + submission.checkin_date + '</p>' +
      '<p><strong>Name:</strong> ' + submission.guest_name + '</p>' +
      '<p><strong>Email:</strong> ' + submission.guest_email + '</p>';
  } else {
    // Show initial form
    initialForm.hidden = false;
    activityForm.hidden = true;
  }

  /* ---------- Initial form submission -------------------- */
  document.getElementById('initialForm').onsubmit = async e => {
    e.preventDefault();

    const data = {
      propertyId: propSel.value,
      checkinDate: document.getElementById('date').value,
      guestName: document.getElementById('name').value,
      guestEmail: document.getElementById('email').value
    };

    console.log("Submitting initial form:", data);

    try {
      const res = await fetch('/submit/initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        alert("Error: " + errorText);
        return;
      }

      const json = await res.json();
      console.log("Response:", json);

      // Show confirmation message
      initialForm.hidden = true;
      document.getElementById('thanks').hidden = false;
      document.getElementById('thanks').innerHTML =
        '<h2>\u2713 Check Your Email</h2>' +
        '<p style="color:#64748b;margin-bottom:1.5rem">We\\'ve sent a verification link to <strong>' + data.guestEmail + '</strong></p>' +
        '<p style="color:#94a3b8;font-size:0.875rem">Click the link in the email to continue with your waiver.</p>';
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Error: " + error.message);
    }
  };

  /* ---------- activity checkboxes ------------------------- */
  const actsDiv = document.getElementById('activities');
  const masterCheck = document.getElementById('master');
  let chosen = new Map();

  function loadActivities() {
    const selectedProp = props.find(p => p.id === (submission ? submission.property_id : propSel.value));
    const activities = selectedProp?.activities ?? [];

    actsDiv.innerHTML = '';
    chosen.clear();
    masterCheck.disabled = true;
    masterCheck.checked = false;

    activities.forEach(a => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'activity-row';

      const itemDiv = document.createElement('div');
      itemDiv.className = 'activity-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'activity-' + a.slug;
      checkbox.value = a.slug;

      const label = document.createElement('label');
      label.htmlFor = 'activity-' + a.slug;

      const labelText = document.createElement('span');
      labelText.className = 'activity-label-text';
      labelText.textContent = a.label;
      label.appendChild(labelText);

      if (a.risk) {
        const chipWrapper = document.createElement('div');
        chipWrapper.className = 'risk-chip-wrapper';

        const riskChip = document.createElement('span');
        riskChip.className = 'risk-chip risk-' + a.risk;
        riskChip.textContent = a.risk.charAt(0).toUpperCase() + a.risk.slice(1) + ' Risk';

        const riskDetails = document.createElement('span');
        riskDetails.className = 'risk-details';

        const riskData = risks[a.risk];
        if (riskData) {
          riskDetails.textContent = riskData.description || 'Activity-specific risks apply';
        } else {
          riskDetails.textContent = 'Activity-specific risks apply';
        }

        chipWrapper.appendChild(riskChip);
        chipWrapper.appendChild(riskDetails);
        label.appendChild(chipWrapper);
      }

      const initialInput = document.createElement('input');
      initialInput.type = 'text';
      initialInput.maxLength = 4;
      initialInput.placeholder = 'Initials';
      initialInput.className = 'activity-initial';
      initialInput.dataset.slug = a.slug;
      initialInput.oninput = validateMasterCheckbox;

      checkbox.onchange = () => {
        if (checkbox.checked) {
          chosen.set(a.slug, {itemDiv, initialInput});
          initialInput.classList.add('visible');
          itemDiv.classList.add('checked');
        } else {
          chosen.delete(a.slug);
          initialInput.classList.remove('visible');
          initialInput.value = '';
          itemDiv.classList.remove('checked');
        }
        validateMasterCheckbox();
      };

      itemDiv.appendChild(checkbox);
      itemDiv.appendChild(label);

      itemDiv.onclick = () => {
        checkbox.checked = !checkbox.checked;
        checkbox.onchange();
      };

      rowDiv.appendChild(itemDiv);
      rowDiv.appendChild(initialInput);
      actsDiv.appendChild(rowDiv);
    });
  }

  function validateMasterCheckbox() {
    let allFilled = true;
    for (const [slug, {initialInput}] of chosen) {
      if (!initialInput.value.trim()) {
        allFilled = false;
        break;
      }
    }
    masterCheck.disabled = !allFilled || chosen.size === 0;
    if (masterCheck.disabled) {
      masterCheck.checked = false;
    }
  }

  if (submission) {
    loadActivities();
    validateMasterCheckbox();
  }

  /* ---------- signature pad -------------------------------- */
  const canvas = document.getElementById('sign');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let drawing = false;

  canvas.addEventListener('pointerdown', e => {
    drawing = true;
    ctx.moveTo(e.offsetX, e.offsetY);
  });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  });
  canvas.addEventListener('pointerup', () => drawing = false);
  document.getElementById('clearSig').onclick =
    () => ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* ---------- activity form submit --------------------------------------- */
  document.getElementById('activityForm').onsubmit = async e => {
    e.preventDefault();

    if (!submission) {
      alert('Invalid submission. Please start over.');
      return;
    }

    const data = {
      submissionId: submission.submission_id,
      activities: [...chosen.keys()],
      initials: Object.fromEntries(
        [...chosen.entries()].map(([slug, {initialInput}]) =>
          [slug, initialInput.value])),
      signature: canvas.toDataURL(),
      accepted: document.getElementById('master').checked
    };

    console.log("Submitting activity form:", data);

    try {
      const res = await fetch('/submit/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Server error:", errorText);
        alert("Error submitting form: " + errorText);
        return;
      }

      const json = await res.json();
      console.log("Response data:", json);

      document.getElementById('activityForm').hidden = true;
      document.getElementById('thanks').hidden = false;

      if (json.devMode) {
        let html = '<h2>\u2713 Waivers Generated</h2>';
        html += '<p style="color:#64748b;margin-bottom:1.5rem">Your waivers are ready to download</p>';
        html += '<div style="display:flex;flex-direction:column;gap:12px">';

        json.downloads.forEach(pdf => {
          html += '<button onclick="window.open(&quot;' + pdf.url + '&quot;, &quot;_blank&quot;)" ';
          html += 'style="padding:12px 24px;background:#3b82f6;color:white;border:none;';
          html += 'border-radius:8px;cursor:pointer;font-size:1rem;font-weight:600;';
          html += 'transition:background 0.2s"';
          html += ' onmouseover="this.style.background=&quot;#2563eb&quot;"';
          html += ' onmouseout="this.style.background=&quot;#3b82f6&quot;">';
          html += '\u{1F4C4} Download ' + pdf.filename + '</button>';
        });

        html += '</div>';

        if (json.downloads.length > 1) {
          html += '<button onclick="';
          json.downloads.forEach(pdf => {
            html += 'window.open(&quot;' + pdf.url + '&quot;, &quot;_blank&quot;);';
          });
          html += '" style="padding:14px 28px;background:#10b981;color:white;border:none;';
          html += 'border-radius:8px;cursor:pointer;font-size:1rem;font-weight:600;margin-top:12px;';
          html += 'transition:background 0.2s"';
          html += ' onmouseover="this.style.background=&quot;#059669&quot;"';
          html += ' onmouseout="this.style.background=&quot;#10b981&quot;">';
          html += '\u{1F4E6} Download All (' + json.downloads.length + ' PDFs)</button>';
        }

        if (json.pin) {
          html += '<div style="margin-top:1.5rem;padding:1rem;background:#fef3c7;border:2px solid #fbbf24;border-radius:8px">';
          html += '<p style="margin:0;color:#78350f;font-weight:600">Archery PIN: <strong>' + json.pin + '</strong></p></div>';
        }

        html += '<p style="margin-top:1.5rem;color:#94a3b8;font-size:0.875rem">';
        html += '\u26A0\uFE0F Development Mode - PDFs stored locally, not emailed</p>';

        document.getElementById('thanks').innerHTML = html;
      } else {
        let html = '<h2>\u2713 Success</h2>';
        html += '<p style="color:#64748b;margin-bottom:1.5rem">Your waivers have been sent to your email</p>';
        if (json.pin) {
          html += '<div style="margin-top:1.5rem;padding:1rem;background:#fef3c7;border:2px solid #fbbf24;border-radius:8px">';
          html += '<p style="margin:0;color:#78350f;font-weight:600">Archery PIN: <strong>' + json.pin + '</strong></p></div>';
        }
        document.getElementById('thanks').innerHTML = html;
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Error submitting form: " + error.message);
    }
  };
<\/script>
</body>
</html>`, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
__name(htmlPage, "htmlPage");

// src/routes/root.js
async function handleRoot(request, env2) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  return await htmlPage(env2, token);
}
__name(handleRoot, "handleRoot");

// src/utils/nanoid.js
var urlAlphabet = "useandom26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
  let id = "";
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
}
__name(nanoid, "nanoid");

// src/utils/admin.js
var json = /* @__PURE__ */ __name((obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { "content-type": "application/json" }
}), "json");
var bad = /* @__PURE__ */ __name((msg) => json({ ok: false, error: msg }, 400), "bad");
async function handleAdmin() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin - Activity Waivers</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin-top: 0;
      color: #333;
    }
    .tabs {
      display: flex;
      border-bottom: 2px solid #ddd;
      margin-bottom: 30px;
    }
    .tab {
      padding: 12px 24px;
      cursor: pointer;
      border: none;
      background: none;
      font-size: 16px;
      font-weight: 600;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
    }
    .tab:hover {
      color: #0070f3;
    }
    .tab.active {
      color: #0070f3;
      border-bottom-color: #0070f3;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .search-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    label {
      font-weight: 600;
      margin-bottom: 5px;
      color: #555;
      font-size: 14px;
    }
    input, select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      width: 100%;
      max-width: 400px;
      box-sizing: border-box;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #0070f3;
    }
    .button-group {
      grid-column: 1 / -1;
      display: flex;
      gap: 10px;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-search, .btn-primary {
      background: #0070f3;
      color: white;
    }
    .btn-search:hover, .btn-primary:hover {
      background: #0051cc;
    }
    .btn-clear {
      background: #eee;
      color: #333;
    }
    .btn-clear:hover {
      background: #ddd;
    }
    .btn-danger {
      background: #dc3545;
      color: white;
      padding: 8px 15px;
      font-size: 13px;
      margin-left: 5px;
    }
    .btn-danger:hover {
      background: #c82333;
    }
    .btn-warning {
      background: #ffc107;
      color: #000;
      padding: 8px 15px;
      font-size: 13px;
      margin-left: 5px;
    }
    .btn-warning:hover {
      background: #e0a800;
    }
    .results {
      margin-top: 20px;
    }
    .result-count {
      margin-bottom: 15px;
      color: #666;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    thead {
      background: #f9f9f9;
    }
    th {
      text-align: left;
      padding: 12px;
      border-bottom: 2px solid #ddd;
      font-weight: 600;
      color: #555;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    tr:hover {
      background: #f9f9f9;
    }
    .activity-badge {
      display: inline-block;
      padding: 4px 8px;
      margin: 2px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .activity-badge:hover {
      background: #1976d2;
      color: white;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .error {
      padding: 15px;
      background: #fee;
      color: #c33;
      border-radius: 4px;
      margin: 20px 0;
    }
    .message {
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    .empty {
      text-align: center;
      padding: 40px;
      color: #999;
    }
    .section {
      margin-bottom: 40px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    h2 {
      margin-top: 0;
      font-size: 20px;
      color: #555;
    }
    .activities-list {
      margin-top: 20px;
    }
    .activity-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .activity-info {
      flex: 1;
    }
    .activity-slug {
      font-weight: 600;
      color: #333;
      font-size: 16px;
    }
    .activity-label {
      color: #666;
      margin: 5px 0;
    }
    .risk-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 5px;
    }
    .risk-low {
      background: #d4edda;
      color: #155724;
    }
    .risk-medium {
      background: #fff3cd;
      color: #856404;
    }
    .risk-high {
      background: #f8d7da;
      color: #721c24;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Activity Waivers Admin</h1>

    <div class="tabs">
      <button class="tab active" onclick="showTab('search')">Search Submissions</button>
      <button class="tab" onclick="showTab('activities')">Manage Activities</button>
      <button class="tab" onclick="showTab('properties')">Manage Properties</button>
      <button class="tab" onclick="showTab('releases')">Legal Releases</button>
      <button class="tab" onclick="showTab('debug')">Debug</button>
      <button class="tab" onclick="showTab('api')">API Documentation</button>
    </div>

    <!-- Search Tab -->
    <div id="searchTab" class="tab-content active">
      <form class="search-form" id="searchForm">
        <div class="form-group">
          <label for="name">Guest Name</label>
          <input type="text" id="name" name="name" placeholder="John Doe">
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="guest@example.com">
        </div>

        <div class="form-group">
          <label for="prop">Property ID</label>
          <input type="text" id="prop" name="prop" placeholder="cabin-12">
        </div>

        <div class="form-group">
          <label for="date">Check-in Date</label>
          <input type="date" id="date" name="date">
        </div>

        <div class="form-group">
          <label for="activity">Activity</label>
          <input type="text" id="activity" name="activity" placeholder="archery">
        </div>

        <div class="button-group">
          <button type="submit" class="btn-search">Search</button>
          <button type="button" class="btn-clear" onclick="clearForm()">Clear</button>
        </div>
      </form>

      <div class="results" id="results"></div>
    </div>

    <!-- Activities Tab -->
    <div id="activitiesTab" class="tab-content">
      <div id="message"></div>

      <div class="section">
        <h2>Property</h2>
        <div class="form-group">
          <label for="propertySelect">Select Property</label>
          <select id="propertySelect" onchange="loadActivities()">
            <option value="">Loading...</option>
          </select>
        </div>
      </div>

      <div class="section">
        <h2>Add New Activity</h2>
        <form id="addForm">
          <div class="form-group">
            <label for="addSlug">Slug (e.g., rock-climbing)</label>
            <input type="text" id="addSlug" required placeholder="rock-climbing">
          </div>
          <div class="form-group">
            <label for="addLabel">Label (Display Name)</label>
            <input type="text" id="addLabel" required placeholder="Rock Climbing">
          </div>
          <div class="form-group">
            <label for="addRisk">Risk Level</label>
            <select id="addRisk" required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button type="submit" class="btn-primary">Add Activity</button>
        </form>
      </div>

      <div class="section">
        <h2>Current Activities</h2>
        <div id="activitiesList" class="activities-list">
          <div class="loading">Loading...</div>
        </div>
      </div>
    </div>

    <!-- Properties Tab -->
    <div id="propertiesTab" class="tab-content">
      <div id="propMessage"></div>

      <div class="section">
        <h2>Add New Property</h2>
        <form id="addPropertyForm">
          <div class="form-group">
            <label for="propId">Property ID (e.g., cabin-12)</label>
            <input type="text" id="propId" required placeholder="cabin-12">
          </div>
          <div class="form-group">
            <label for="propName">Property Name</label>
            <input type="text" id="propName" required placeholder="Cabin 12">
          </div>
          <div class="form-group">
            <label for="copyDefaultActivities" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="copyDefaultActivities" checked style="cursor: pointer;">
              <span>Copy default activities template</span>
            </label>
          </div>
          <button type="submit" class="btn-primary">Add Property</button>
        </form>
      </div>

      <div class="section">
        <h2>Current Properties</h2>
        <div id="propertiesList" class="activities-list">
          <div class="loading">Loading...</div>
        </div>
      </div>
    </div>

    <!-- Legal Releases Tab -->
    <div id="releasesTab" class="tab-content">
      <div id="releaseMessage"></div>

      <div class="section">
        <h2>Current Release</h2>
        <div id="currentRelease" class="current-release">
          <div class="loading">Loading...</div>
        </div>
      </div>

      <div class="section">
        <h2>Create New Release</h2>
        <form id="releaseForm">
          <div class="form-group">
            <label for="releaseVersion">Version</label>
            <input type="text" id="releaseVersion" placeholder="Leave blank to auto-increment" pattern="[0-9]+.[0-9]+.[0-9]+">
            <small style="color: #666; margin-top: 5px; display: block;">Format: X.Y.Z (e.g., 1.0.1) - Leave blank to auto-increment patch version</small>
          </div>
          <div class="form-group">
            <label for="waiverText">Legal Waiver Text</label>
            <textarea id="waiverText" required rows="12" style="font-family: system-ui, sans-serif; resize: vertical; min-height: 200px;"></textarea>
          </div>
          <button type="submit" class="btn-primary">Create Release</button>
        </form>
      </div>

      <div class="section">
        <h2>Release History</h2>
        <div id="releaseHistory" class="release-history">
          <div class="loading">Loading...</div>
        </div>
      </div>
    </div>

    <!-- Debug Tab -->
    <div id="debugTab" class="tab-content">
      <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <strong>\u26A0\uFE0F Note:</strong> Debug data is cached and auto-updates every 7 days. Click "Refresh Data" to force an update.
      </div>

      <div style="margin-bottom: 20px;">
        <button class="btn-primary" onclick="loadDebugData(true)" style="padding: 10px 20px;">
          \u{1F504} Refresh Data
        </button>
        <span id="debugLastUpdate" style="margin-left: 15px; color: #666; font-size: 14px;"></span>
      </div>

      <div class="section">
        <h2>KV Store (PROPS_KV)</h2>
        <div id="kvData" style="background: #f9f9f9; padding: 15px; border-radius: 4px; overflow-x: auto;">
          <div class="loading">Loading...</div>
        </div>
      </div>

      <div class="section">
        <h2>D1 Database Tables</h2>
        <div id="d1Tables" style="margin-top: 15px;">
          <div class="loading">Loading...</div>
        </div>
      </div>
    </div>

    <!-- API Documentation Tab -->
    <div id="apiTab" class="tab-content">
      <div style="max-width: 900px; margin: 0 auto;">
        <div style="background: white; padding: 30px; border-radius: 8px; line-height: 1.6;">
          <div id="apiDocs" style="font-family: system-ui, sans-serif;">
            <!-- API documentation will be rendered here -->
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let currentProperties = [];

    // Tab switching
    function showTab(tabName) {
      document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName === 'search' ? 'search' : tabName === 'activities' ? 'activities' : tabName === 'properties' ? 'properties' : tabName === 'releases' ? 'releases' : tabName === 'debug' ? 'debug' : 'api')) {
          tab.classList.add('active');
        }
      });
      document.getElementById(tabName + 'Tab').classList.add('active');

      if (tabName === 'activities') {
        loadPropertySelector();
        loadActivities();
      }
      if (tabName === 'properties') {
        loadProperties();
      }
      if (tabName === 'releases') {
        loadReleases();
      }
      if (tabName === 'debug') {
        loadDebugData();
      }
      if (tabName === 'api') {
        loadApiDocs();
      }
    }

    async function loadPropertySelector() {
      const selector = document.getElementById('propertySelect');
      try {
        const response = await fetch('/admin/properties');
        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        currentProperties = data.properties;
        selector.innerHTML = currentProperties.map(p =>
          \`<option value="\${p.id}">\${p.name}</option>\`
        ).join('');

      } catch (error) {
        selector.innerHTML = '<option value="">Error loading properties</option>';
      }
    }

    // Search functionality
    const form = document.getElementById('searchForm');
    const resultsDiv = document.getElementById('results');

    window.addEventListener('load', () => search());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      search();
    });

    async function search() {
      resultsDiv.innerHTML = '<div class="loading">Loading...</div>';

      const formData = new FormData(form);
      const params = new URLSearchParams();

      for (const [key, value] of formData) {
        if (value.trim()) {
          params.append(key, value.trim());
        }
      }

      try {
        const response = await fetch('/admin/search?' + params.toString());
        const data = await response.json();

        if (!data.rows.success) {
          throw new Error('Search failed');
        }

        displayResults(data.rows.results);
      } catch (error) {
        resultsDiv.innerHTML = '<div class="error">Error loading results: ' + error.message + '</div>';
      }
    }

    function displayResults(results) {
      if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="empty">No results found</div>';
        return;
      }

      const countHtml = '<div class="result-count">Found ' + results.length + ' submission' + (results.length !== 1 ? 's' : '') + '</div>';

      const tableHtml = \`
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Guest Name</th>
              <th>Email</th>
              <th>Property</th>
              <th>Check-in</th>
              <th>Activities</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            \${results.map(row => {
              const createdDate = new Date(row.created_at).toLocaleString();
              const activities = JSON.parse(row.activities);

              return \`
                <tr>
                  <td>\${createdDate}</td>
                  <td>\${escapeHtml(row.guest_name)}</td>
                  <td>\${escapeHtml(row.guest_email)}</td>
                  <td>\${escapeHtml(row.property_id)}</td>
                  <td>\${row.checkin_date}</td>
                  <td>
                    \${activities.map(a =>
                      '<span class="activity-badge">' +
                      escapeHtml(a) + '</span>'
                    ).join('')}
                  </td>
                  <td>
                    <button class="btn-primary" onclick="downloadAllWaivers('\${escapeHtml(row.submission_id)}')" style="padding: 8px 12px; font-size: 13px;">Download All</button>
                  </td>
                </tr>
              \`;
            }).join('')}
          </tbody>
        </table>
      \`;

      resultsDiv.innerHTML = countHtml + tableHtml;
    }

    function clearForm() {
      form.reset();
      search();
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Activities Management
    const messageDiv = document.getElementById('message');
    const activitiesList = document.getElementById('activitiesList');

    function showMessage(text, type = 'success') {
      messageDiv.innerHTML = \`<div class="message \${type}">\${text}</div>\`;
      setTimeout(() => messageDiv.innerHTML = '', 5000);
    }

    async function loadActivities() {
      const selector = document.getElementById('propertySelect');
      const propertyId = selector.value;

      if (!propertyId) return;

      try {
        const response = await fetch(\`/admin/activities?property=\${propertyId}\`);
        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        displayActivities(data.activities);
      } catch (error) {
        activitiesList.innerHTML = \`<div class="error">Error loading activities: \${error.message}</div>\`;
      }
    }

    function displayActivities(activities) {
      if (activities.length === 0) {
        activitiesList.innerHTML = '<p>No activities found.</p>';
        return;
      }

      activitiesList.innerHTML = activities.map(activity => \`
        <div class="activity-item">
          <div class="activity-info">
            <div class="activity-slug">\${activity.slug}</div>
            <div class="activity-label">\${activity.label}</div>
            <span class="risk-badge risk-\${activity.risk}">\${activity.risk.toUpperCase()}</span>
          </div>
          <div class="activity-actions">
            <button class="btn-warning" onclick="editActivity('\${activity.slug}', '\${activity.label}', '\${activity.risk}')">Edit</button>
            <button class="btn-danger" onclick="removeActivity('\${activity.slug}')">Remove</button>
          </div>
        </div>
      \`).join('');
    }

    document.getElementById('addForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const selector = document.getElementById('propertySelect');
      const propertyId = selector.value;

      if (!propertyId) {
        showMessage('Please select a property first', 'error');
        return;
      }

      const slug = document.getElementById('addSlug').value.trim();
      const label = document.getElementById('addLabel').value.trim();
      const risk = document.getElementById('addRisk').value;

      try {
        const response = await fetch(\`/admin/activities/add?property=\${propertyId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, label, risk })
        });

        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        showMessage(\`Activity "\${label}" added successfully!\`);
        document.getElementById('addForm').reset();
        loadActivities();
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });

    async function removeActivity(slug) {
      if (!confirm(\`Remove activity "\${slug}"?\`)) return;

      const selector = document.getElementById('propertySelect');
      const propertyId = selector.value;

      try {
        const response = await fetch(\`/admin/activities/remove?property=\${propertyId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug })
        });

        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        showMessage(\`Activity "\${slug}" removed successfully!\`);
        loadActivities();
      } catch (error) {
        showMessage(error.message, 'error');
      }
    }

    function editActivity(slug, currentLabel, currentRisk) {
      const newLabel = prompt('Enter new label:', currentLabel);
      if (newLabel === null) return;

      const newRisk = prompt('Enter risk level (low/medium/high):', currentRisk);
      if (newRisk === null) return;

      if (!['low', 'medium', 'high'].includes(newRisk.toLowerCase())) {
        showMessage('Invalid risk level. Must be low, medium, or high.', 'error');
        return;
      }

      updateActivity(slug, newLabel, newRisk.toLowerCase());
    }

    async function updateActivity(slug, label, risk) {
      const selector = document.getElementById('propertySelect');
      const propertyId = selector.value;

      try {
        const response = await fetch(\`/admin/activities/update?property=\${propertyId}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, label, risk })
        });

        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        showMessage(\`Activity "\${slug}" updated successfully!\`);
        loadActivities();
      } catch (error) {
        showMessage(error.message, 'error');
      }
    }

    // Properties Management
    const propMessageDiv = document.getElementById('propMessage');
    const propertiesList = document.getElementById('propertiesList');

    function showPropMessage(text, type = 'success') {
      propMessageDiv.innerHTML = \`<div class="message \${type}">\${text}</div>\`;
      setTimeout(() => propMessageDiv.innerHTML = '', 5000);
    }

    async function loadProperties() {
      try {
        const response = await fetch('/admin/properties');
        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        displayProperties(data.properties);
      } catch (error) {
        propertiesList.innerHTML = \`<div class="error">Error loading properties: \${error.message}</div>\`;
      }
    }

    function displayProperties(properties) {
      if (properties.length === 0) {
        propertiesList.innerHTML = '<p>No properties found.</p>';
        return;
      }

      propertiesList.innerHTML = properties.map(property => \`
        <div class="activity-item">
          <div class="activity-info">
            <div class="activity-slug">\${property.id}</div>
            <div class="activity-label">\${property.name}</div>
          </div>
          <div class="activity-actions">
            <button class="btn-danger" onclick="removeProperty('\${property.id}')">Remove</button>
          </div>
        </div>
      \`).join('');
    }

    document.getElementById('addPropertyForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('propId').value.trim();
      const name = document.getElementById('propName').value.trim();
      const copyDefaults = document.getElementById('copyDefaultActivities').checked;

      try {
        const response = await fetch('/admin/properties/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, name, copyDefaultActivities: copyDefaults })
        });

        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        showPropMessage(\`Property "\${name}" added successfully!\`);
        document.getElementById('addPropertyForm').reset();
        document.getElementById('copyDefaultActivities').checked = true;
        loadProperties();
      } catch (error) {
        showPropMessage(error.message, 'error');
      }
    });

    async function removeProperty(id) {
      if (!confirm(\`Remove property "\${id}"?\`)) return;

      try {
        const response = await fetch('/admin/properties/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });

        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        showPropMessage(\`Property "\${id}" removed successfully!\`);
        loadProperties();
      } catch (error) {
        showPropMessage(error.message, 'error');
      }
    }

    // Hash verification only
    async function verifyDocumentHash(submissionId, activity) {
      try {
        const docResponse = await fetch('/admin/document?submission=' + submissionId + '&activity=' + activity);
        const docData = await docResponse.json();

        if (!docData.ok) {
          alert('Error: ' + docData.error);
          return;
        }

        const verifyResponse = await fetch('/admin/verify?document=' + docData.document_id);
        const verifyData = await verifyResponse.json();

        if (!verifyData.ok) {
          alert('Error: ' + verifyData.error);
          return;
        }

        if (verifyData.verified) {
          alert('\u2713 Hash Verified Successfully\\n\\nDocument ID: ' + docData.document_id + '\\nStored Hash: ' + verifyData.stored_hash.substring(0, 16) + '...\\nComputed Hash: ' + verifyData.computed_hash.substring(0, 16) + '...');
        } else {
          alert('\u2717 Hash Verification Failed\\n\\nDocument may have been tampered with\\nDocument ID: ' + docData.document_id + '\\nStored Hash: ' + verifyData.stored_hash.substring(0, 16) + '...\\nComputed Hash: ' + verifyData.computed_hash.substring(0, 16) + '...');
        }
      } catch (error) {
        alert('Error verifying hash: ' + error.message);
      }
    }

    async function downloadAllWaivers(submissionId) {
      window.location.href = '/admin/download-all?submission=' + submissionId;
    }

    // Legal Releases functionality
    async function loadReleases() {
      const currentReleaseDiv = document.getElementById('currentRelease');
      const historyDiv = document.getElementById('releaseHistory');

      try {
        const response = await fetch('/admin/releases');
        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        // Display current release
        if (data.current) {
          const rel = data.current;
          currentReleaseDiv.innerHTML = \`
            <div style="padding: 15px; background: #f0f9ff; border-left: 4px solid #0070f3; border-radius: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="font-size: 18px;">Version \${rel.version}</strong>
                <span style="color: #666; font-size: 14px;">\${new Date(rel.release_date).toLocaleDateString()}</span>
              </div>
              <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #333; margin-top: 10px;">\${rel.waiver_text}</div>
            </div>
          \`;
        } else {
          currentReleaseDiv.innerHTML = '<div class="empty">No releases yet. Create the first release below.</div>';
        }

        // Display history
        if (data.releases && data.releases.length > 0) {
          historyDiv.innerHTML = data.releases.map(rel => \`
            <div style="padding: 12px; background: #fafafa; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong>Version \${rel.version}</strong>
                <span style="color: #666; font-size: 13px;">\${new Date(rel.release_date).toLocaleDateString()}</span>
              </div>
              <div style="white-space: pre-wrap; font-size: 13px; line-height: 1.5; color: #555; margin-top: 8px; max-height: 100px; overflow-y: auto;">\${rel.waiver_text}</div>
            </div>
          \`).join('');
        } else {
          historyDiv.innerHTML = '<div class="empty">No release history</div>';
        }

        // Populate form with current waiver text
        if (data.current) {
          document.getElementById('waiverText').value = data.current.waiver_text;
        }
      } catch (error) {
        currentReleaseDiv.innerHTML = '<div class="error">Error loading releases: ' + error.message + '</div>';
        historyDiv.innerHTML = '';
      }
    }

    document.getElementById('releaseForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const version = document.getElementById('releaseVersion').value.trim();
      const waiverText = document.getElementById('waiverText').value.trim();

      try {
        const response = await fetch('/admin/releases/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: version || null, waiver_text: waiverText })
        });

        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        showReleaseMessage(\`Release version \${data.version} created successfully!\`);
        document.getElementById('releaseVersion').value = '';
        loadReleases();
      } catch (error) {
        showReleaseMessage(error.message, 'error');
      }
    });

    function showReleaseMessage(msg, type = 'success') {
      const div = document.getElementById('releaseMessage');
      div.innerHTML = \`<div class="\${type === 'error' ? 'error' : 'success'}">\${msg}</div>\`;
      setTimeout(() => div.innerHTML = '', 5000);
    }

    // Debug functionality
    async function loadDebugData(forceRefresh = false) {
      const kvDataDiv = document.getElementById('kvData');
      const d1TablesDiv = document.getElementById('d1Tables');
      const lastUpdateSpan = document.getElementById('debugLastUpdate');

      try {
        kvDataDiv.innerHTML = '<div class="loading">Loading KV data...</div>';
        d1TablesDiv.innerHTML = '<div class="loading">Loading D1 tables...</div>';

        const response = await fetch('/admin/debug' + (forceRefresh ? '?refresh=true' : ''));
        const data = await response.json();

        if (!data.ok) {
          throw new Error(data.error);
        }

        // Display last update time
        const lastUpdate = new Date(data.lastUpdate);
        lastUpdateSpan.textContent = 'Last updated: ' + lastUpdate.toLocaleString();

        // Display KV data
        let kvHtml = '<h3>All KV Keys</h3>';
        if (data.kv && Object.keys(data.kv).length > 0) {
          for (const [key, value] of Object.entries(data.kv)) {
            kvHtml += '<div style="margin-bottom: 20px; padding: 15px; background: white; border: 1px solid #ddd; border-radius: 4px;">';
            kvHtml += '<strong style="color: #0070f3; font-family: monospace;">' + escapeHtml(key) + '</strong>';
            kvHtml += '<pre style="margin: 10px 0 0 0; padding: 10px; background: #f5f5f5; border-radius: 4px; overflow-x: auto; font-size: 12px;">' + escapeHtml(JSON.stringify(value, null, 2)) + '</pre>';
            kvHtml += '</div>';
          }
        } else {
          kvHtml += '<p style="color: #666;">No KV data found</p>';
        }
        kvDataDiv.innerHTML = kvHtml;

        // Display D1 tables
        let d1Html = '';
        if (data.d1 && Object.keys(data.d1).length > 0) {
          for (const [tableName, tableData] of Object.entries(data.d1)) {
            d1Html += '<div style="margin-bottom: 30px;">';
            d1Html += '<h3 style="margin-bottom: 10px;">' + escapeHtml(tableName) + ' (' + tableData.count + ' rows)</h3>';

            if (tableData.rows && tableData.rows.length > 0) {
              d1Html += '<div style="overflow-x: auto;">';
              d1Html += '<table style="width: 100%; border-collapse: collapse; background: white;">';

              // Table headers
              d1Html += '<thead><tr>';
              const columns = Object.keys(tableData.rows[0]);
              columns.forEach(col => {
                d1Html += '<th style="padding: 10px; text-align: left; background: #f5f5f5; border: 1px solid #ddd; font-weight: 600;">' + escapeHtml(col) + '</th>';
              });
              d1Html += '</tr></thead>';

              // Table rows (limit to first 50 rows)
              d1Html += '<tbody>';
              tableData.rows.slice(0, 50).forEach(row => {
                d1Html += '<tr>';
                columns.forEach(col => {
                  let value = row[col];
                  if (value === null) value = '<em style="color: #999;">null</em>';
                  else if (typeof value === 'object') value = JSON.stringify(value);
                  else value = escapeHtml(String(value));
                  d1Html += '<td style="padding: 10px; border: 1px solid #ddd; font-size: 13px;">' + value + '</td>';
                });
                d1Html += '</tr>';
              });
              d1Html += '</tbody>';
              d1Html += '</table>';
              d1Html += '</div>';

              if (tableData.count > 50) {
                d1Html += '<p style="margin-top: 10px; color: #666; font-size: 13px;"><em>Showing first 50 of ' + tableData.count + ' rows</em></p>';
              }
            } else {
              d1Html += '<p style="color: #666;">No data in this table</p>';
            }
            d1Html += '</div>';
          }
        } else {
          d1Html += '<p style="color: #666;">No D1 tables found</p>';
        }
        d1TablesDiv.innerHTML = d1Html;

      } catch (error) {
        kvDataDiv.innerHTML = '<div class="error">Error loading KV data: ' + escapeHtml(error.message) + '</div>';
        d1TablesDiv.innerHTML = '<div class="error">Error loading D1 data: ' + escapeHtml(error.message) + '</div>';
      }
    }

    // API Documentation functionality
    function loadApiDocs() {
      const apiDocsDiv = document.getElementById('apiDocs');
      apiDocsDiv.innerHTML = \`<div class="loading">Loading API documentation...</div>\`;

      fetch('/admin/api-docs')
        .then(response => response.text())
        .then(markdown => {
          apiDocsDiv.innerHTML = convertMarkdownToHTML(markdown);
        })
        .catch(error => {
          apiDocsDiv.innerHTML = '<div class="error">Error loading API documentation</div>';
        });
    }

    // Simple markdown to HTML converter
    function convertMarkdownToHTML(markdown) {
      let html = markdown
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Headers
        .replace(/^### (.+)$/gm, '<h3 style="margin-top: 30px; color: #333;">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 style="margin-top: 40px; color: #0070f3; border-bottom: 2px solid #0070f3; padding-bottom: 10px;">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 style="color: #0070f3;">$1</h1>')
        // Bold
        .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
        // Code blocks
        .replace(/\`\`\`(\\w+)?\\n([\\s\\S]*?)\`\`\`/g, '<pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; border: 1px solid #ddd;"><code>$2</code></pre>')
        // Inline code
        .replace(/\`([^\`]+)\`/g, '<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em;">$1</code>')
        // Horizontal rule
        .replace(/^---$/gm, '<hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">')
        // Lists
        .replace(/^- (.+)$/gm, '<li style="margin: 5px 0;">$1</li>')
        // Wrap consecutive list items
        .replace(/(<li[^>]*>.*<\\/li>\\n?)+/g, '<ul style="margin: 10px 0; padding-left: 30px;">$&</ul>')
        // Paragraphs
        .replace(/^(?!<[h|u|p|l|d|c])(\\S.*)$/gm, '<p style="margin: 10px 0;">$1</p>');

      return html;
    }
  <\/script>
</body>
</html>`;
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(handleAdmin, "handleAdmin");

// src/services/validation.js
function validateSubmission(data) {
  const must = [
    "propertyId",
    "checkinDate",
    "guestName",
    "guestEmail",
    "activities",
    "initials",
    "signature",
    "accepted"
  ];
  for (const k of must) {
    if (data[k] === void 0 || data[k] === "" || Array.isArray(data[k]) && !data[k].length) {
      return `missing ${k}`;
    }
  }
  if (data.accepted !== true) {
    return "master acceptance not ticked";
  }
  return null;
}
__name(validateSubmission, "validateSubmission");

// src/services/storage.js
async function saveSubmission(env2, subId, data, createdAt) {
  await env2.waivers.prepare(
    "INSERT INTO submissions VALUES(?1,?2,?3,?4,?5,?6,?7)"
  ).bind(
    subId,
    createdAt,
    data.propertyId,
    data.checkinDate,
    data.guestName,
    data.guestEmail,
    JSON.stringify(data.activities)
  ).run();
}
__name(saveSubmission, "saveSubmission");
async function saveDocuments(env2, subId, pdfInfos) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const p of pdfInfos) {
    await env2.waivers.prepare(
      "INSERT INTO documents VALUES(?1,?2,?3,?4,?5)"
    ).bind(p.id, subId, p.activity, p.r2Key, p.initials).run();
    const hashId = `hash_${p.id}`;
    await env2.waivers.prepare(
      "INSERT INTO hashes VALUES(?1,?2,?3,?4)"
    ).bind(hashId, p.id, p.hash, now).run();
  }
}
__name(saveDocuments, "saveDocuments");

// src/services/pdf.js
async function generateDocumentHash(data) {
  const hashInput = JSON.stringify({
    submission_id: data.submission_id,
    property_id: data.property_id,
    checkin_date: data.checkin_date,
    guest_name: data.guest_name,
    guest_email: data.guest_email,
    activity: data.activity,
    activity_label: data.activity_label,
    initials: data.initials,
    signature_key: data.signature_key,
    created_at: data.created_at,
    release_version: data.release_version,
    release_date: data.release_date
  });
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(hashInput);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
__name(generateDocumentHash, "generateDocumentHash");
function generateWaiverHTML(data, activityInfo, riskData, latestRelease, documentId, documentHash) {
  const riskLevel = activityInfo?.risk || "medium";
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 1in;
    }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #000;
      margin: 0;
      padding: 20px;
    }

    h1 {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 30px;
      text-transform: uppercase;
    }

    .details {
      margin-bottom: 30px;
      line-height: 2;
    }

    .risk-section {
      margin: 30px 0;
    }

    .risk-level {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 10px;
    }

    .risk-description {
      color: #4a4a4a;
      font-size: 10pt;
      margin-bottom: 20px;
    }

    .waiver-section {
      margin: 30px 0;
    }

    .waiver-title {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 10px;
    }

    .waiver-text {
      font-size: 9pt;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    .signature-section {
      margin-top: 40px;
      page-break-inside: avoid;
    }

    .signature-label {
      font-size: 12pt;
      margin-bottom: 10px;
    }

    .signature-image {
      max-width: 400px;
      max-height: 150px;
    }

    .footer {
      position: fixed;
      bottom: 0.5in;
      right: 1in;
      text-align: right;
      font-size: 7pt;
      color: #808080;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <h1>${data.activity.toUpperCase()} \u2014 Release of Liability</h1>

  <div class="details">
    Property  : ${data.propertyId}<br>
    Check-in  : ${data.checkinDate}<br>
    Guest     : ${data.guestName}<br>
    Initials  : ${data.initials[data.activity]}
  </div>

  <div class="risk-section">
    <div class="risk-level">Risk Level: ${riskLevel.toUpperCase()}</div>
    ${riskData?.description ? `<div class="risk-description">${riskData.description}</div>` : ""}
  </div>

  <div class="waiver-section">
    <div class="waiver-title">Waiver and Release:</div>
    <div class="waiver-text">${latestRelease.waiver_text}</div>
  </div>

  <div class="signature-section">
    <div class="signature-label">Signature:</div>
    ${data.signature ? `<img src="${data.signature}" class="signature-image" />` : '<p style="color: #808080;">No signature provided</p>'}
  </div>

  <div class="footer">
    Legal Version ${latestRelease.version} (${latestRelease.release_date}) \u2022 Document ID: ${documentId}<br>
    Verification Hash: ${documentHash.substring(0, 32)}...
  </div>
</body>
</html>`;
}
__name(generateWaiverHTML, "generateWaiverHTML");
async function makePDFs(data, subId, env2) {
  const now = /* @__PURE__ */ new Date();
  const createdAt = now.toISOString();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const latestRelease = await env2.waivers.prepare(
    "SELECT version, release_date, waiver_text FROM releases ORDER BY release_date DESC, version DESC LIMIT 1"
  ).first();
  if (!latestRelease) {
    throw new Error("No legal release found. Please create a release in the admin panel first.");
  }
  const activitiesResult = await env2.waivers.prepare(
    "SELECT slug, label, risk FROM activities WHERE property_id = ?"
  ).bind(data.propertyId).all();
  const activities = activitiesResult.results || [];
  const risksResult = await env2.waivers.prepare(
    "SELECT level, description FROM risk_descriptions"
  ).all();
  const risks = {};
  for (const row of risksResult.results || []) {
    risks[row.level] = { description: row.description };
  }
  let signatureKey = null;
  if (data.signature) {
    try {
      const signatureData = data.signature.split(",")[1];
      const signatureBytes = Uint8Array.from(atob(signatureData), (c) => c.charCodeAt(0));
      const nameParts = data.guestName.trim().split(/\s+/);
      const firstName = nameParts[0]?.toLowerCase().replace(/[^a-z]/g, "") || "unknown";
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, "") : "unknown";
      signatureKey = `waivers/${y}/${m}/${d}/${data.propertyId}/signatures/${lastName}-${firstName}-${subId}.png`;
      await env2.WAIVERS_R2.put(signatureKey, signatureBytes, {
        httpMetadata: { contentType: "image/png" }
      });
    } catch (err) {
      console.error("Error saving signature to R2:", err);
    }
  }
  const results = [];
  for (const act of data.activities) {
    const activityInfo = activities.find((a) => a.slug === act);
    const riskLevel = activityInfo?.risk || "medium";
    const riskData = risks[riskLevel];
    const nameParts = data.guestName.trim().split(/\s+/);
    const firstName = nameParts[0]?.toLowerCase().replace(/[^a-z]/g, "") || "unknown";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, "") : "unknown";
    const documentId = nanoid(12);
    const hashData = {
      submission_id: subId,
      property_id: data.propertyId,
      checkin_date: data.checkinDate,
      guest_name: data.guestName,
      guest_email: data.guestEmail,
      activity: act,
      activity_label: activityInfo?.label || act,
      initials: data.initials[act],
      signature_key: signatureKey,
      created_at: createdAt,
      release_version: latestRelease.version,
      release_date: latestRelease.release_date
    };
    const documentHash = await generateDocumentHash(hashData);
    const htmlContent = generateWaiverHTML(
      { ...data, activity: act },
      activityInfo,
      riskData,
      latestRelease,
      documentId,
      documentHash
    );
    let pdfBytes;
    try {
      const browser = await env2.BROWSER.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "networkidle" });
      pdfBytes = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "1in",
          right: "1in",
          bottom: "1in",
          left: "1in"
        }
      });
      await browser.close();
    } catch (err) {
      console.error("Error generating PDF with browser rendering:", err);
      throw new Error(`Failed to generate PDF for activity ${act}: ${err.message}`);
    }
    const filename = `${lastName}-${firstName}-${subId}.pdf`;
    const key = `waivers/${y}/${m}/${d}/${data.propertyId}/${act}/${lastName}-${firstName}-${subId}.pdf`;
    await env2.WAIVERS_R2.put(key, pdfBytes, {
      httpMetadata: { contentType: "application/pdf" }
    });
    results.push({
      id: documentId,
      activity: act,
      filename,
      r2Key: key,
      bytes: pdfBytes,
      hash: documentHash,
      initials: data.initials[act]
    });
  }
  return results;
}
__name(makePDFs, "makePDFs");

// node_modules/resend/dist/index.mjs
var __defProp2 = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = /* @__PURE__ */ __name((obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value, "__defNormalProp");
var __spreadValues = /* @__PURE__ */ __name((a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
}, "__spreadValues");
var __spreadProps = /* @__PURE__ */ __name((a, b) => __defProps(a, __getOwnPropDescs(b)), "__spreadProps");
var __objRest = /* @__PURE__ */ __name((source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
}, "__objRest");
var __async = /* @__PURE__ */ __name((__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = /* @__PURE__ */ __name((value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }, "fulfilled");
    var rejected = /* @__PURE__ */ __name((value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    }, "rejected");
    var step = /* @__PURE__ */ __name((x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected), "step");
    step((generator = generator.apply(__this, __arguments)).next());
  });
}, "__async");
var version2 = "6.1.1";
function buildPaginationQuery(options) {
  const searchParams = new URLSearchParams();
  if (options.limit !== void 0) {
    searchParams.set("limit", options.limit.toString());
  }
  if ("after" in options && options.after !== void 0) {
    searchParams.set("after", options.after);
  }
  if ("before" in options && options.before !== void 0) {
    searchParams.set("before", options.before);
  }
  return searchParams.toString();
}
__name(buildPaginationQuery, "buildPaginationQuery");
var ApiKeys = class {
  static {
    __name(this, "ApiKeys");
  }
  constructor(resend) {
    this.resend = resend;
  }
  create(_0) {
    return __async(this, arguments, function* (payload, options = {}) {
      const data = yield this.resend.post(
        "/api-keys",
        payload,
        options
      );
      return data;
    });
  }
  list() {
    return __async(this, arguments, function* (options = {}) {
      const queryString = buildPaginationQuery(options);
      const url = queryString ? `/api-keys?${queryString}` : "/api-keys";
      const data = yield this.resend.get(url);
      return data;
    });
  }
  remove(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.delete(
        `/api-keys/${id}`
      );
      return data;
    });
  }
};
var Audiences = class {
  static {
    __name(this, "Audiences");
  }
  constructor(resend) {
    this.resend = resend;
  }
  create(_0) {
    return __async(this, arguments, function* (payload, options = {}) {
      const data = yield this.resend.post(
        "/audiences",
        payload,
        options
      );
      return data;
    });
  }
  list() {
    return __async(this, arguments, function* (options = {}) {
      const queryString = buildPaginationQuery(options);
      const url = queryString ? `/audiences?${queryString}` : "/audiences";
      const data = yield this.resend.get(url);
      return data;
    });
  }
  get(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.get(
        `/audiences/${id}`
      );
      return data;
    });
  }
  remove(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.delete(
        `/audiences/${id}`
      );
      return data;
    });
  }
};
function parseAttachments(attachments) {
  return attachments == null ? void 0 : attachments.map((attachment) => ({
    content: attachment.content,
    filename: attachment.filename,
    path: attachment.path,
    content_type: attachment.contentType,
    content_id: attachment.contentId
  }));
}
__name(parseAttachments, "parseAttachments");
function parseEmailToApiOptions(email) {
  return {
    attachments: parseAttachments(email.attachments),
    bcc: email.bcc,
    cc: email.cc,
    from: email.from,
    headers: email.headers,
    html: email.html,
    reply_to: email.replyTo,
    scheduled_at: email.scheduledAt,
    subject: email.subject,
    tags: email.tags,
    text: email.text,
    to: email.to
  };
}
__name(parseEmailToApiOptions, "parseEmailToApiOptions");
function render(node) {
  return new Promise((resolve, reject) => {
    import("@react-email/render").then(({ render: render2 }) => {
      resolve(render2(node));
    }).catch(() => {
      reject(
        Error(
          "Failed to render React component. Make sure to install `@react-email/render`"
        )
      );
    });
  });
}
__name(render, "render");
var Batch = class {
  static {
    __name(this, "Batch");
  }
  constructor(resend) {
    this.resend = resend;
  }
  send(payload, options) {
    return __async(this, null, function* () {
      return this.create(payload, options);
    });
  }
  create(payload, options) {
    return __async(this, null, function* () {
      var _a;
      const emails = [];
      for (const email of payload) {
        if (email.react) {
          email.html = yield render(email.react);
          email.react = void 0;
        }
        emails.push(parseEmailToApiOptions(email));
      }
      const data = yield this.resend.post(
        "/emails/batch",
        emails,
        __spreadProps(__spreadValues({}, options), {
          headers: __spreadValues({
            "x-batch-validation": (_a = options == null ? void 0 : options.batchValidation) != null ? _a : "strict"
          }, options == null ? void 0 : options.headers)
        })
      );
      return data;
    });
  }
};
var Broadcasts = class {
  static {
    __name(this, "Broadcasts");
  }
  constructor(resend) {
    this.resend = resend;
  }
  create(_0) {
    return __async(this, arguments, function* (payload, options = {}) {
      if (payload.react) {
        payload.html = yield render(payload.react);
      }
      const data = yield this.resend.post(
        "/broadcasts",
        {
          name: payload.name,
          audience_id: payload.audienceId,
          preview_text: payload.previewText,
          from: payload.from,
          html: payload.html,
          reply_to: payload.replyTo,
          subject: payload.subject,
          text: payload.text
        },
        options
      );
      return data;
    });
  }
  send(id, payload) {
    return __async(this, null, function* () {
      const data = yield this.resend.post(
        `/broadcasts/${id}/send`,
        { scheduled_at: payload == null ? void 0 : payload.scheduledAt }
      );
      return data;
    });
  }
  list() {
    return __async(this, arguments, function* (options = {}) {
      const queryString = buildPaginationQuery(options);
      const url = queryString ? `/broadcasts?${queryString}` : "/broadcasts";
      const data = yield this.resend.get(url);
      return data;
    });
  }
  get(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.get(
        `/broadcasts/${id}`
      );
      return data;
    });
  }
  remove(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.delete(
        `/broadcasts/${id}`
      );
      return data;
    });
  }
  update(id, payload) {
    return __async(this, null, function* () {
      if (payload.react) {
        payload.html = yield render(payload.react);
      }
      const data = yield this.resend.patch(
        `/broadcasts/${id}`,
        {
          name: payload.name,
          audience_id: payload.audienceId,
          from: payload.from,
          html: payload.html,
          text: payload.text,
          subject: payload.subject,
          reply_to: payload.replyTo,
          preview_text: payload.previewText
        }
      );
      return data;
    });
  }
};
var Contacts = class {
  static {
    __name(this, "Contacts");
  }
  constructor(resend) {
    this.resend = resend;
  }
  create(_0) {
    return __async(this, arguments, function* (payload, options = {}) {
      const data = yield this.resend.post(
        `/audiences/${payload.audienceId}/contacts`,
        {
          unsubscribed: payload.unsubscribed,
          email: payload.email,
          first_name: payload.firstName,
          last_name: payload.lastName
        },
        options
      );
      return data;
    });
  }
  list(options) {
    return __async(this, null, function* () {
      const _a = options, { audienceId } = _a, paginationOptions = __objRest(_a, ["audienceId"]);
      const queryString = buildPaginationQuery(paginationOptions);
      const url = queryString ? `/audiences/${audienceId}/contacts?${queryString}` : `/audiences/${audienceId}/contacts`;
      const data = yield this.resend.get(url);
      return data;
    });
  }
  get(options) {
    return __async(this, null, function* () {
      if (!options.id && !options.email) {
        return {
          data: null,
          error: {
            message: "Missing `id` or `email` field.",
            name: "missing_required_field"
          }
        };
      }
      const data = yield this.resend.get(
        `/audiences/${options.audienceId}/contacts/${(options == null ? void 0 : options.email) ? options == null ? void 0 : options.email : options == null ? void 0 : options.id}`
      );
      return data;
    });
  }
  update(options) {
    return __async(this, null, function* () {
      if (!options.id && !options.email) {
        return {
          data: null,
          error: {
            message: "Missing `id` or `email` field.",
            name: "missing_required_field"
          }
        };
      }
      const data = yield this.resend.patch(
        `/audiences/${options.audienceId}/contacts/${(options == null ? void 0 : options.email) ? options == null ? void 0 : options.email : options == null ? void 0 : options.id}`,
        {
          unsubscribed: options.unsubscribed,
          first_name: options.firstName,
          last_name: options.lastName
        }
      );
      return data;
    });
  }
  remove(payload) {
    return __async(this, null, function* () {
      if (!payload.id && !payload.email) {
        return {
          data: null,
          error: {
            message: "Missing `id` or `email` field.",
            name: "missing_required_field"
          }
        };
      }
      const data = yield this.resend.delete(
        `/audiences/${payload.audienceId}/contacts/${(payload == null ? void 0 : payload.email) ? payload == null ? void 0 : payload.email : payload == null ? void 0 : payload.id}`
      );
      return data;
    });
  }
};
function parseDomainToApiOptions(domain2) {
  return {
    name: domain2.name,
    region: domain2.region,
    custom_return_path: domain2.customReturnPath
  };
}
__name(parseDomainToApiOptions, "parseDomainToApiOptions");
var Domains = class {
  static {
    __name(this, "Domains");
  }
  constructor(resend) {
    this.resend = resend;
  }
  create(_0) {
    return __async(this, arguments, function* (payload, options = {}) {
      const data = yield this.resend.post(
        "/domains",
        parseDomainToApiOptions(payload),
        options
      );
      return data;
    });
  }
  list() {
    return __async(this, arguments, function* (options = {}) {
      const queryString = buildPaginationQuery(options);
      const url = queryString ? `/domains?${queryString}` : "/domains";
      const data = yield this.resend.get(url);
      return data;
    });
  }
  get(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.get(
        `/domains/${id}`
      );
      return data;
    });
  }
  update(payload) {
    return __async(this, null, function* () {
      const data = yield this.resend.patch(
        `/domains/${payload.id}`,
        {
          click_tracking: payload.clickTracking,
          open_tracking: payload.openTracking,
          tls: payload.tls
        }
      );
      return data;
    });
  }
  remove(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.delete(
        `/domains/${id}`
      );
      return data;
    });
  }
  verify(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.post(
        `/domains/${id}/verify`
      );
      return data;
    });
  }
};
var Emails = class {
  static {
    __name(this, "Emails");
  }
  constructor(resend) {
    this.resend = resend;
  }
  send(_0) {
    return __async(this, arguments, function* (payload, options = {}) {
      return this.create(payload, options);
    });
  }
  create(_0) {
    return __async(this, arguments, function* (payload, options = {}) {
      if (payload.react) {
        payload.html = yield render(payload.react);
      }
      const data = yield this.resend.post(
        "/emails",
        parseEmailToApiOptions(payload),
        options
      );
      return data;
    });
  }
  get(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.get(
        `/emails/${id}`
      );
      return data;
    });
  }
  list() {
    return __async(this, arguments, function* (options = {}) {
      const queryString = buildPaginationQuery(options);
      const url = queryString ? `/emails?${queryString}` : "/emails";
      const data = yield this.resend.get(url);
      return data;
    });
  }
  update(payload) {
    return __async(this, null, function* () {
      const data = yield this.resend.patch(
        `/emails/${payload.id}`,
        {
          scheduled_at: payload.scheduledAt
        }
      );
      return data;
    });
  }
  cancel(id) {
    return __async(this, null, function* () {
      const data = yield this.resend.post(
        `/emails/${id}/cancel`
      );
      return data;
    });
  }
};
var defaultBaseUrl = "https://api.resend.com";
var defaultUserAgent = `resend-node:${version2}`;
var baseUrl = typeof process !== "undefined" && process.env ? process.env.RESEND_BASE_URL || defaultBaseUrl : defaultBaseUrl;
var userAgent = typeof process !== "undefined" && process.env ? process.env.RESEND_USER_AGENT || defaultUserAgent : defaultUserAgent;
var Resend = class {
  static {
    __name(this, "Resend");
  }
  constructor(key) {
    this.key = key;
    this.apiKeys = new ApiKeys(this);
    this.audiences = new Audiences(this);
    this.batch = new Batch(this);
    this.broadcasts = new Broadcasts(this);
    this.contacts = new Contacts(this);
    this.domains = new Domains(this);
    this.emails = new Emails(this);
    if (!key) {
      if (typeof process !== "undefined" && process.env) {
        this.key = process.env.RESEND_API_KEY;
      }
      if (!this.key) {
        throw new Error(
          'Missing API key. Pass it to the constructor `new Resend("re_123")`'
        );
      }
    }
    this.headers = new Headers({
      Authorization: `Bearer ${this.key}`,
      "User-Agent": userAgent,
      "Content-Type": "application/json"
    });
  }
  fetchRequest(_0) {
    return __async(this, arguments, function* (path, options = {}) {
      try {
        const response = yield fetch(`${baseUrl}${path}`, options);
        if (!response.ok) {
          try {
            const rawError = yield response.text();
            return { data: null, error: JSON.parse(rawError) };
          } catch (err) {
            if (err instanceof SyntaxError) {
              return {
                data: null,
                error: {
                  name: "application_error",
                  message: "Internal server error. We are unable to process your request right now, please try again later."
                }
              };
            }
            const error3 = {
              message: response.statusText,
              name: "application_error"
            };
            if (err instanceof Error) {
              return { data: null, error: __spreadProps(__spreadValues({}, error3), { message: err.message }) };
            }
            return { data: null, error: error3 };
          }
        }
        const data = yield response.json();
        return { data, error: null };
      } catch (e) {
        return {
          data: null,
          error: {
            name: "application_error",
            message: "Unable to fetch data. The request could not be resolved."
          }
        };
      }
    });
  }
  post(_0, _1) {
    return __async(this, arguments, function* (path, entity, options = {}) {
      const headers = new Headers(this.headers);
      if (options.headers) {
        for (const [key, value] of new Headers(options.headers).entries()) {
          headers.set(key, value);
        }
      }
      if (options.idempotencyKey) {
        headers.set("Idempotency-Key", options.idempotencyKey);
      }
      const requestOptions = __spreadProps(__spreadValues({
        method: "POST",
        body: JSON.stringify(entity)
      }, options), {
        headers
      });
      return this.fetchRequest(path, requestOptions);
    });
  }
  get(_0) {
    return __async(this, arguments, function* (path, options = {}) {
      const headers = new Headers(this.headers);
      if (options.headers) {
        for (const [key, value] of new Headers(options.headers).entries()) {
          headers.set(key, value);
        }
      }
      const requestOptions = __spreadProps(__spreadValues({
        method: "GET"
      }, options), {
        headers
      });
      return this.fetchRequest(path, requestOptions);
    });
  }
  put(_0, _1) {
    return __async(this, arguments, function* (path, entity, options = {}) {
      const headers = new Headers(this.headers);
      if (options.headers) {
        for (const [key, value] of new Headers(options.headers).entries()) {
          headers.set(key, value);
        }
      }
      const requestOptions = __spreadProps(__spreadValues({
        method: "PUT",
        body: JSON.stringify(entity)
      }, options), {
        headers
      });
      return this.fetchRequest(path, requestOptions);
    });
  }
  patch(_0, _1) {
    return __async(this, arguments, function* (path, entity, options = {}) {
      const headers = new Headers(this.headers);
      if (options.headers) {
        for (const [key, value] of new Headers(options.headers).entries()) {
          headers.set(key, value);
        }
      }
      const requestOptions = __spreadProps(__spreadValues({
        method: "PATCH",
        body: JSON.stringify(entity)
      }, options), {
        headers
      });
      return this.fetchRequest(path, requestOptions);
    });
  }
  delete(path, query) {
    return __async(this, null, function* () {
      const requestOptions = {
        method: "DELETE",
        body: JSON.stringify(query),
        headers: this.headers
      };
      return this.fetchRequest(path, requestOptions);
    });
  }
};

// src/services/mail.js
async function sendVerificationEmail(email, name, verificationUrl, env2) {
  const resend = new Resend(env2.RESEND_API_KEY);
  const bodyText = `Hi ${name},

Thank you for starting your activity waiver submission!

Please click the link below to continue and complete your waiver:
${verificationUrl}

This link will expire in 24 hours.

If you didn't request this waiver, you can safely ignore this email.

Regards,
The Rentals Team`;
  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3b82f6;">Complete Your Activity Waiver</h2>
      <p>Hi ${name},</p>
      <p>Thank you for starting your activity waiver submission!</p>
      <p>Please click the button below to continue and complete your waiver:</p>
      <div style="margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
          Complete Your Waiver
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">This link will expire in 24 hours.</p>
      <p style="color: #64748b; font-size: 14px;">If you didn't request this waiver, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      <p style="color: #94a3b8; font-size: 12px;">Regards,<br>The Rentals Team</p>
    </div>
  `;
  try {
    const { data: emailData, error: error3 } = await resend.emails.send({
      from: `Activity Waivers <${env2.EMAIL_FROM}>`,
      to: email,
      subject: "Complete Your Activity Waiver",
      text: bodyText,
      html: bodyHtml
    });
    if (error3) {
      console.error("Resend error:", error3);
      throw new Error(error3.message);
    }
    console.log("Verification email sent successfully:", emailData);
  } catch (error3) {
    console.error("Verification email send error:", error3);
    throw new Error("Failed to send verification email: " + error3.message);
  }
}
__name(sendVerificationEmail, "sendVerificationEmail");
async function sendWaiverEmail(data, pdfs, pin, env2) {
  const resend = new Resend(env2.RESEND_API_KEY);
  const bodyText = `Hi ${data.guestName},

Thank you for completing your waiver for ${data.propertyId}.
Attached: ${pdfs.map((p) => p.filename).join(", ")}

${pin ? "Your Archery PIN is " + pin + "\n\n" : ""}Regards,
The Rentals Team`;
  try {
    const { data: emailData, error: error3 } = await resend.emails.send({
      from: `Activity Waivers <${env2.EMAIL_FROM}>`,
      to: data.guestEmail,
      subject: "Your activity waiver(s)",
      text: bodyText,
      attachments: pdfs.map((p) => ({
        filename: p.filename,
        content: btoa(String.fromCharCode(...new Uint8Array(p.bytes)))
      }))
    });
    if (error3) {
      console.error("Resend error:", error3);
      throw new Error(error3.message);
    }
    console.log("Email sent successfully:", emailData);
  } catch (error3) {
    console.error("Email send error:", error3);
    throw new Error("Failed to send email: " + error3.message);
  }
}
__name(sendWaiverEmail, "sendWaiverEmail");
async function sendMail(data, pdfs, pin, env2) {
  const resend = new Resend(env2.RESEND_API_KEY);
  const bodyText = `Hi ${data.guestName},

Thank you for completing your waiver for ${data.propertyId}.
Attached: ${pdfs.map((p) => p.filename).join(", ")}

${pin ? "Your Archery PIN is " + pin + "\n\n" : ""}Regards,
The Rentals Team`;
  try {
    const { data: emailData, error: error3 } = await resend.emails.send({
      from: `Activity Waivers <${env2.EMAIL_FROM}>`,
      to: data.guestEmail,
      subject: "Your activity waiver(s)",
      text: bodyText,
      attachments: pdfs.map((p) => ({
        filename: p.filename,
        content: btoa(String.fromCharCode(...new Uint8Array(p.bytes)))
      }))
    });
    if (error3) {
      console.error("Resend error:", error3);
      throw new Error(error3.message);
    }
    console.log("Email sent successfully:", emailData);
  } catch (error3) {
    console.error("Email send error:", error3);
    throw new Error("Failed to send email: " + error3.message);
  }
}
__name(sendMail, "sendMail");

// src/routes/submit.js
async function handleSubmit(request, env2) {
  console.log("Submit endpoint called");
  const data = await request.json();
  console.log("Received data:", data);
  const validationError = validateSubmission(data);
  if (validationError) {
    return bad(validationError);
  }
  const subId = nanoid(10);
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await saveSubmission(env2, subId, data, createdAt);
    console.log("Submission saved to database");
  } catch (dbError) {
    console.error("Database error:", dbError);
    return json({ ok: false, error: "Database not initialized. Run migrations first." }, 500);
  }
  let pdfInfos;
  try {
    pdfInfos = await makePDFs(data, subId, env2);
    console.log("PDFs generated:", pdfInfos.length);
  } catch (pdfError) {
    console.error("PDF generation error:", pdfError);
    return json({ ok: false, error: "PDF generation failed: " + pdfError.message }, 500);
  }
  try {
    await saveDocuments(env2, subId, pdfInfos);
    console.log("Document records saved");
  } catch (docError) {
    console.error("Document save error:", docError);
  }
  const pin = data.activities.includes("archery") ? env2.ARCHERY_PIN : null;
  if (env2.DEV_MODE === "true") {
    const downloads = pdfInfos.map((p) => ({
      filename: p.filename,
      url: `/download/${p.r2Key}`
    }));
    return json({
      ok: true,
      devMode: true,
      downloads,
      pin
    });
  }
  try {
    await sendMail(data, pdfInfos, pin, env2);
    console.log("Email sent successfully");
  } catch (emailError) {
    console.error("Email sending failed:", emailError);
    return json({ ok: false, error: "Email sending failed: " + emailError.message }, 500);
  }
  return json({
    ok: true,
    emailed: pdfInfos.map((p) => p.filename),
    pin
  });
}
__name(handleSubmit, "handleSubmit");

// src/routes/submit-flow.js
async function handleInitialSubmit(request, env2) {
  try {
    const data = await request.json();
    if (!data.propertyId || !data.checkinDate || !data.guestName || !data.guestEmail) {
      return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    const submissionId = nanoid(12);
    const verificationToken = nanoid(32);
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString();
    await env2.waivers.prepare(
      `INSERT INTO submissions
       (submission_id, created_at, property_id, checkin_date, guest_name, guest_email, activities,
        status, verification_token, token_expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      submissionId,
      createdAt,
      data.propertyId,
      data.checkinDate,
      data.guestName,
      data.guestEmail,
      "[]",
      // Empty activities initially
      "pending",
      verificationToken,
      expiresAt
    ).run();
    const verificationUrl = `${new URL(request.url).origin}/?token=${verificationToken}`;
    if (env2.DEV_MODE === "true") {
      console.log("Dev Mode: Verification email would be sent to:", data.guestEmail);
      console.log("Dev Mode: Verification URL:", verificationUrl);
      return new Response(JSON.stringify({
        ok: true,
        devMode: true,
        submissionId,
        verificationUrl
      }), {
        headers: { "content-type": "application/json" }
      });
    } else {
      await sendVerificationEmail(data.guestEmail, data.guestName, verificationUrl, env2);
      return new Response(JSON.stringify({
        ok: true,
        submissionId
      }), {
        headers: { "content-type": "application/json" }
      });
    }
  } catch (error3) {
    console.error("Initial submission error:", error3);
    return new Response(JSON.stringify({ ok: false, error: error3.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
__name(handleInitialSubmit, "handleInitialSubmit");
async function handleCompleteSubmit(request, env2) {
  try {
    const data = await request.json();
    if (!data.submissionId || !data.activities || !data.initials || !data.signature || !data.accepted) {
      return new Response(JSON.stringify({ ok: false, error: "Missing required fields" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }
    const submission = await env2.waivers.prepare(
      "SELECT * FROM submissions WHERE submission_id = ? AND status = ?"
    ).bind(data.submissionId, "pending").first();
    if (!submission) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid or expired submission" }), {
        status: 404,
        headers: { "content-type": "application/json" }
      });
    }
    const expires = new Date(submission.token_expires_at);
    if (expires < /* @__PURE__ */ new Date()) {
      return new Response(JSON.stringify({ ok: false, error: "Verification token expired" }), {
        status: 410,
        headers: { "content-type": "application/json" }
      });
    }
    const completedAt = (/* @__PURE__ */ new Date()).toISOString();
    await env2.waivers.prepare(
      "UPDATE submissions SET activities = ?, status = ?, completed_at = ? WHERE submission_id = ?"
    ).bind(
      JSON.stringify(data.activities),
      "completed",
      completedAt,
      data.submissionId
    ).run();
    const submissionData = {
      propertyId: submission.property_id,
      checkinDate: submission.checkin_date,
      guestName: submission.guest_name,
      guestEmail: submission.guest_email,
      activities: data.activities,
      initials: data.initials,
      signature: data.signature
    };
    const pdfs = await makePDFs(submissionData, data.submissionId, env2);
    let archeryPin = null;
    if (data.activities.includes("archery")) {
      archeryPin = env2.ARCHERY_PIN || "1234";
    }
    if (env2.DEV_MODE === "true") {
      const downloads = pdfs.map((p) => ({
        filename: p.filename,
        url: `/download/${p.id}`
      }));
      return new Response(JSON.stringify({
        ok: true,
        devMode: true,
        downloads,
        pin: archeryPin
      }), {
        headers: { "content-type": "application/json" }
      });
    } else {
      await sendWaiverEmail(submissionData, pdfs, archeryPin, env2);
      return new Response(JSON.stringify({
        ok: true,
        emailed: pdfs.map((p) => p.filename),
        pin: archeryPin
      }), {
        headers: { "content-type": "application/json" }
      });
    }
  } catch (error3) {
    console.error("Complete submission error:", error3);
    return new Response(JSON.stringify({ ok: false, error: error3.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
__name(handleCompleteSubmit, "handleCompleteSubmit");

// src/routes/admin/search.js
async function handleAdminSearch(request, env2) {
  const url = new URL(request.url);
  const qName = url.searchParams.get("name") ?? "";
  const qEmail = url.searchParams.get("email") ?? "";
  const qProp = url.searchParams.get("prop") ?? "";
  const qDate = url.searchParams.get("date") ?? "";
  const qActivity = url.searchParams.get("activity") ?? "";
  const conditions = [];
  const params = [];
  if (qName) {
    conditions.push("guest_name LIKE ?");
    params.push(`%${qName}%`);
  }
  if (qEmail) {
    conditions.push("guest_email LIKE ?");
    params.push(`%${qEmail}%`);
  }
  if (qProp) {
    conditions.push("property_id LIKE ?");
    params.push(`%${qProp}%`);
  }
  if (qDate) {
    conditions.push("checkin_date LIKE ?");
    params.push(`%${qDate}%`);
  }
  if (qActivity) {
    conditions.push("activities LIKE ?");
    params.push(`%${qActivity}%`);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM submissions
                 ${whereClause}
                 ORDER BY created_at DESC
                 LIMIT 200`;
  const rows = await env2.waivers.prepare(query).bind(...params).all();
  return json({ rows });
}
__name(handleAdminSearch, "handleAdminSearch");

// src/routes/admin/activities.js
async function handleAdminActivities(request, env2) {
  const url = new URL(request.url);
  const { pathname } = url;
  const propertyId = url.searchParams.get("property") || "cabin-12";
  if (request.method === "GET") {
    return await getActivities(env2, propertyId);
  }
  if (request.method === "POST") {
    if (pathname === "/admin/activities/add") {
      return await addActivity(request, env2, propertyId);
    }
    if (pathname === "/admin/activities/remove") {
      return await removeActivity(request, env2, propertyId);
    }
    if (pathname === "/admin/activities/update") {
      return await updateActivity(request, env2, propertyId);
    }
    return await replaceAllActivities(request, env2, propertyId);
  }
  return new Response("Method not allowed", { status: 405 });
}
__name(handleAdminActivities, "handleAdminActivities");
async function getActivities(env2, propertyId) {
  const result = await env2.waivers.prepare(
    "SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label"
  ).bind(propertyId).all();
  return json({ ok: true, propertyId, activities: result.results || [] });
}
__name(getActivities, "getActivities");
async function addActivity(request, env2, propertyId) {
  const data = await request.json();
  if (!data.slug || !data.label || !data.risk) {
    return json({ ok: false, error: "Must provide slug, label, and risk" }, 400);
  }
  const existingCheck = await env2.waivers.prepare(
    "SELECT id FROM activities WHERE property_id = ? AND slug = ?"
  ).bind(propertyId, data.slug).first();
  if (existingCheck) {
    return json({ ok: false, error: "Activity with this slug already exists" }, 400);
  }
  await env2.waivers.prepare(
    "INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(propertyId, data.slug, data.label, data.risk, (/* @__PURE__ */ new Date()).toISOString()).run();
  const result = await env2.waivers.prepare(
    "SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label"
  ).bind(propertyId).all();
  return json({ ok: true, propertyId, activities: result.results || [], added: data.slug });
}
__name(addActivity, "addActivity");
async function removeActivity(request, env2, propertyId) {
  const data = await request.json();
  if (!data.slug) {
    return json({ ok: false, error: "Must provide slug" }, 400);
  }
  const existingCheck = await env2.waivers.prepare(
    "SELECT id FROM activities WHERE property_id = ? AND slug = ?"
  ).bind(propertyId, data.slug).first();
  if (!existingCheck) {
    return json({ ok: false, error: "Activity not found" }, 404);
  }
  await env2.waivers.prepare(
    "DELETE FROM activities WHERE property_id = ? AND slug = ?"
  ).bind(propertyId, data.slug).run();
  const result = await env2.waivers.prepare(
    "SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label"
  ).bind(propertyId).all();
  return json({ ok: true, propertyId, activities: result.results || [], removed: data.slug });
}
__name(removeActivity, "removeActivity");
async function updateActivity(request, env2, propertyId) {
  const data = await request.json();
  if (!data.slug) {
    return json({ ok: false, error: "Must provide slug" }, 400);
  }
  const existingCheck = await env2.waivers.prepare(
    "SELECT id FROM activities WHERE property_id = ? AND slug = ?"
  ).bind(propertyId, data.slug).first();
  if (!existingCheck) {
    return json({ ok: false, error: "Activity not found" }, 404);
  }
  const updates = [];
  const bindings = [];
  if (data.label) {
    updates.push("label = ?");
    bindings.push(data.label);
  }
  if (data.risk) {
    updates.push("risk = ?");
    bindings.push(data.risk);
  }
  if (updates.length > 0) {
    bindings.push(propertyId, data.slug);
    await env2.waivers.prepare(
      `UPDATE activities SET ${updates.join(", ")} WHERE property_id = ? AND slug = ?`
    ).bind(...bindings).run();
  }
  const result = await env2.waivers.prepare(
    "SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label"
  ).bind(propertyId).all();
  return json({ ok: true, propertyId, activities: result.results || [], updated: data.slug });
}
__name(updateActivity, "updateActivity");
async function replaceAllActivities(request, env2, propertyId) {
  const data = await request.json();
  if (!Array.isArray(data.activities)) {
    return json({ ok: false, error: "activities must be an array" }, 400);
  }
  for (const activity of data.activities) {
    if (!activity.slug || !activity.label || !activity.risk) {
      return json({ ok: false, error: "Each activity must have slug, label, and risk" }, 400);
    }
  }
  await env2.waivers.prepare(
    "DELETE FROM activities WHERE property_id = ?"
  ).bind(propertyId).run();
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  for (const activity of data.activities) {
    await env2.waivers.prepare(
      "INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(propertyId, activity.slug, activity.label, activity.risk, timestamp).run();
  }
  const result = await env2.waivers.prepare(
    "SELECT slug, label, risk FROM activities WHERE property_id = ? ORDER BY label"
  ).bind(propertyId).all();
  return json({ ok: true, propertyId, activities: result.results || [] });
}
__name(replaceAllActivities, "replaceAllActivities");

// src/routes/admin/risks.js
async function handleAdminRisks(request, env2) {
  const url = new URL(request.url);
  const level = url.searchParams.get("level");
  if (request.method === "GET") {
    if (level) {
      return await getRisk(env2, level);
    }
    return await getAllRisks(env2);
  }
  if (request.method === "POST") {
    return await updateRisk(request, env2);
  }
  return new Response("Method not allowed", { status: 405 });
}
__name(handleAdminRisks, "handleAdminRisks");
async function getAllRisks(env2) {
  const result = await env2.waivers.prepare(
    "SELECT level, description FROM risk_descriptions"
  ).all();
  const risks = {};
  for (const row of result.results || []) {
    risks[row.level] = { level: row.level, description: row.description };
  }
  return json({ ok: true, risks });
}
__name(getAllRisks, "getAllRisks");
async function getRisk(env2, level) {
  const result = await env2.waivers.prepare(
    "SELECT level, description FROM risk_descriptions WHERE level = ?"
  ).bind(level).first();
  if (!result) {
    return json({ ok: false, error: "Risk level not found" }, 404);
  }
  return json({ ok: true, risk: { level: result.level, description: result.description } });
}
__name(getRisk, "getRisk");
async function updateRisk(request, env2) {
  const data = await request.json();
  if (!data.level || !data.description) {
    return json({ ok: false, error: "Must provide level and description" }, 400);
  }
  if (!["low", "medium", "high"].includes(data.level)) {
    return json({ ok: false, error: "level must be low, medium, or high" }, 400);
  }
  const existingCheck = await env2.waivers.prepare(
    "SELECT level FROM risk_descriptions WHERE level = ?"
  ).bind(data.level).first();
  if (existingCheck) {
    await env2.waivers.prepare(
      "UPDATE risk_descriptions SET description = ? WHERE level = ?"
    ).bind(data.description, data.level).run();
  } else {
    await env2.waivers.prepare(
      "INSERT INTO risk_descriptions (level, description, created_at) VALUES (?, ?, ?)"
    ).bind(data.level, data.description, (/* @__PURE__ */ new Date()).toISOString()).run();
  }
  const riskData = {
    level: data.level,
    description: data.description
  };
  return json({ ok: true, risk: riskData });
}
__name(updateRisk, "updateRisk");

// src/routes/admin/properties.js
async function handleAdminProperties(request, env2) {
  const url = new URL(request.url);
  const { pathname } = url;
  if (request.method === "GET") {
    return await getProperties(env2);
  }
  if (request.method === "POST") {
    if (pathname === "/admin/properties/add") {
      return await addProperty(request, env2);
    }
    if (pathname === "/admin/properties/remove") {
      return await removeProperty(request, env2);
    }
  }
  return new Response("Method not allowed", { status: 405 });
}
__name(handleAdminProperties, "handleAdminProperties");
async function getProperties(env2) {
  const result = await env2.waivers.prepare(
    "SELECT id, name FROM properties WHERE id != ? ORDER BY name"
  ).bind("default").all();
  return json({ ok: true, properties: result.results || [] });
}
__name(getProperties, "getProperties");
async function addProperty(request, env2) {
  const data = await request.json();
  if (!data.id || !data.name) {
    return json({ ok: false, error: "Must provide id and name" }, 400);
  }
  const existingCheck = await env2.waivers.prepare(
    "SELECT id FROM properties WHERE id = ?"
  ).bind(data.id).first();
  if (existingCheck) {
    return json({ ok: false, error: "Property with this ID already exists" }, 400);
  }
  await env2.waivers.prepare(
    "INSERT INTO properties (id, name, created_at) VALUES (?, ?, ?)"
  ).bind(data.id, data.name, (/* @__PURE__ */ new Date()).toISOString()).run();
  if (data.copyDefaultActivities) {
    const defaultActivities = await env2.waivers.prepare(
      "SELECT slug, label, risk FROM activities WHERE property_id = ?"
    ).bind("default").all();
    for (const activity of defaultActivities.results || []) {
      await env2.waivers.prepare(
        "INSERT INTO activities (property_id, slug, label, risk, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(data.id, activity.slug, activity.label, activity.risk, (/* @__PURE__ */ new Date()).toISOString()).run();
    }
  }
  const result = await env2.waivers.prepare(
    "SELECT id, name FROM properties WHERE id != ? ORDER BY name"
  ).bind("default").all();
  return json({ ok: true, properties: result.results || [], added: data.id });
}
__name(addProperty, "addProperty");
async function removeProperty(request, env2) {
  const data = await request.json();
  if (!data.id) {
    return json({ ok: false, error: "Must provide id" }, 400);
  }
  const countResult = await env2.waivers.prepare(
    "SELECT COUNT(*) as count FROM properties WHERE id != ?"
  ).bind("default").first();
  if (countResult.count <= 1) {
    return json({ ok: false, error: "Cannot delete the last property" }, 400);
  }
  if (data.id === "default") {
    return json({ ok: false, error: "Cannot delete the default property template" }, 400);
  }
  const existingCheck = await env2.waivers.prepare(
    "SELECT id FROM properties WHERE id = ?"
  ).bind(data.id).first();
  if (!existingCheck) {
    return json({ ok: false, error: "Property not found" }, 404);
  }
  await env2.waivers.prepare(
    "DELETE FROM properties WHERE id = ?"
  ).bind(data.id).run();
  const result = await env2.waivers.prepare(
    "SELECT id, name FROM properties WHERE id != ? ORDER BY name"
  ).bind("default").all();
  return json({ ok: true, properties: result.results || [], removed: data.id });
}
__name(removeProperty, "removeProperty");

// src/routes/admin/document.js
async function handleAdminDocument(request, env2) {
  const url = new URL(request.url);
  const submissionId = url.searchParams.get("submission");
  const activity = url.searchParams.get("activity");
  if (!submissionId || !activity) {
    return json({ ok: false, error: "Missing submission or activity" }, 400);
  }
  try {
    const result = await env2.waivers.prepare(
      "SELECT document_id, r2_key FROM documents WHERE submission_id = ?1 AND activity = ?2"
    ).bind(submissionId, activity).first();
    if (!result) {
      return json({ ok: false, error: "Document not found" }, 404);
    }
    return json({
      ok: true,
      document_id: result.document_id,
      r2_key: result.r2_key
    });
  } catch (error3) {
    return json({ ok: false, error: error3.message }, 500);
  }
}
__name(handleAdminDocument, "handleAdminDocument");

// src/routes/admin/verify.js
async function generateDocumentHash2(data) {
  const hashInput = JSON.stringify({
    submission_id: data.submission_id,
    property_id: data.property_id,
    checkin_date: data.checkin_date,
    guest_name: data.guest_name,
    guest_email: data.guest_email,
    activity: data.activity,
    activity_label: data.activity_label,
    initials: data.initials,
    signature_key: data.signature_key,
    created_at: data.created_at,
    release_version: data.release_version,
    release_date: data.release_date
  });
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(hashInput);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
__name(generateDocumentHash2, "generateDocumentHash");
async function handleAdminVerify(request, env2) {
  const url = new URL(request.url);
  const documentId = url.searchParams.get("document");
  if (!documentId) {
    return json({ ok: false, error: "Missing document ID" }, 400);
  }
  try {
    const hashResult = await env2.waivers.prepare(
      "SELECT hash_value FROM hashes WHERE document_id = ?1"
    ).bind(documentId).first();
    if (!hashResult) {
      return json({ ok: false, error: "Hash not found" }, 404);
    }
    const docData = await env2.waivers.prepare(`
      SELECT
        d.activity,
        d.initials,
        s.submission_id,
        s.created_at,
        s.property_id,
        s.checkin_date,
        s.guest_name,
        s.guest_email
      FROM documents d
      JOIN submissions s ON d.submission_id = s.submission_id
      WHERE d.document_id = ?1
    `).bind(documentId).first();
    if (!docData) {
      return json({ ok: false, error: "Document not found" }, 404);
    }
    const activityResult = await env2.waivers.prepare(
      "SELECT label FROM activities WHERE property_id = ? AND slug = ?"
    ).bind(docData.property_id, docData.activity).first();
    const activityInfo = activityResult ? { label: activityResult.label } : null;
    const nameParts = docData.guest_name.trim().split(/\s+/);
    const firstName = nameParts[0]?.toLowerCase().replace(/[^a-z]/g, "") || "unknown";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase().replace(/[^a-z]/g, "") : "unknown";
    const createdDate = new Date(docData.created_at);
    const y = createdDate.getUTCFullYear();
    const m = String(createdDate.getUTCMonth() + 1).padStart(2, "0");
    const d = String(createdDate.getUTCDate()).padStart(2, "0");
    const signatureKey = `waivers/${y}/${m}/${d}/${docData.property_id}/signatures/${lastName}-${firstName}-${docData.submission_id}.png`;
    const release2 = await env2.waivers.prepare(
      "SELECT version, release_date FROM releases WHERE release_date <= ?1 ORDER BY release_date DESC, version DESC LIMIT 1"
    ).bind(docData.created_at.split("T")[0]).first();
    if (!release2) {
      return json({ ok: false, error: "No release found for document creation date" }, 404);
    }
    const hashData = {
      submission_id: docData.submission_id,
      property_id: docData.property_id,
      checkin_date: docData.checkin_date,
      guest_name: docData.guest_name,
      guest_email: docData.guest_email,
      activity: docData.activity,
      activity_label: activityInfo?.label || docData.activity,
      initials: docData.initials || "",
      signature_key: signatureKey,
      created_at: docData.created_at,
      release_version: release2.version,
      release_date: release2.release_date
    };
    const computedHash = await generateDocumentHash2(hashData);
    const verified = computedHash === hashResult.hash_value;
    return json({
      ok: true,
      verified,
      stored_hash: hashResult.hash_value,
      computed_hash: computedHash
    });
  } catch (error3) {
    return json({ ok: false, error: error3.message }, 500);
  }
}
__name(handleAdminVerify, "handleAdminVerify");

// src/routes/admin/releases.js
async function getLatestRelease(env2) {
  return await env2.waivers.prepare(
    "SELECT version, release_date, waiver_text, created_at FROM releases ORDER BY release_date DESC, version DESC LIMIT 1"
  ).first();
}
__name(getLatestRelease, "getLatestRelease");
async function getAllReleases(env2) {
  const result = await env2.waivers.prepare(
    "SELECT version, release_date, waiver_text, created_at FROM releases ORDER BY release_date DESC, version DESC"
  ).all();
  return result.results || [];
}
__name(getAllReleases, "getAllReleases");
function incrementVersion(version3) {
  if (!version3) return "1.0.0";
  const parts = version3.split(".");
  if (parts.length !== 3) return "1.0.0";
  const [major, minor, patch] = parts.map(Number);
  return `${major}.${minor}.${patch + 1}`;
}
__name(incrementVersion, "incrementVersion");
async function handleAdminReleases(request, env2) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (request.method === "GET" && pathname === "/admin/releases") {
    try {
      const current = await getLatestRelease(env2);
      const releases = await getAllReleases(env2);
      return json({
        ok: true,
        current,
        releases
      });
    } catch (error3) {
      return json({ ok: false, error: error3.message }, 500);
    }
  }
  if (request.method === "POST" && pathname === "/admin/releases/create") {
    try {
      const data = await request.json();
      const { version: version3, waiver_text } = data;
      if (!waiver_text || !waiver_text.trim()) {
        return json({ ok: false, error: "Waiver text is required" }, 400);
      }
      let finalVersion = version3;
      if (!finalVersion) {
        const latest = await getLatestRelease(env2);
        finalVersion = incrementVersion(latest?.version);
      }
      if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(finalVersion)) {
        return json({ ok: false, error: "Invalid version format. Must be X.Y.Z (e.g., 1.0.1)" }, 400);
      }
      const existing = await env2.waivers.prepare(
        "SELECT version FROM releases WHERE version = ?1"
      ).bind(finalVersion).first();
      if (existing) {
        return json({ ok: false, error: `Version ${finalVersion} already exists` }, 400);
      }
      const now = /* @__PURE__ */ new Date();
      const releaseDate = now.toISOString().split("T")[0];
      const createdAt = now.toISOString();
      await env2.waivers.prepare(
        "INSERT INTO releases (version, release_date, waiver_text, created_at) VALUES (?1, ?2, ?3, ?4)"
      ).bind(finalVersion, releaseDate, waiver_text.trim(), createdAt).run();
      return json({
        ok: true,
        version: finalVersion,
        release_date: releaseDate
      });
    } catch (error3) {
      return json({ ok: false, error: error3.message }, 500);
    }
  }
  return json({ ok: false, error: "Not found" }, 404);
}
__name(handleAdminReleases, "handleAdminReleases");

// src/routes/admin/download-all.js
async function handleAdminDownloadAll(request, env2) {
  const url = new URL(request.url);
  const submissionId = url.searchParams.get("submission");
  if (!submissionId) {
    return new Response("Missing submission ID", { status: 400 });
  }
  try {
    const documents = await env2.waivers.prepare(
      "SELECT document_id, activity, r2_key FROM documents WHERE submission_id = ?1"
    ).bind(submissionId).all();
    if (!documents.results || documents.results.length === 0) {
      return new Response("No documents found", { status: 404 });
    }
    const submission = await env2.waivers.prepare(
      "SELECT guest_name, checkin_date FROM submissions WHERE submission_id = ?1"
    ).bind(submissionId).first();
    const { zipSync, strToU8 } = await import("fflate");
    const files = {};
    for (const doc of documents.results) {
      const obj = await env2.WAIVERS_R2.get(doc.r2_key);
      if (obj) {
        const arrayBuffer = await obj.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        files[`${doc.activity}-waiver.pdf`] = uint8Array;
      }
    }
    const zipped = zipSync(files, { level: 6 });
    const guestName = submission.guest_name.replace(/[^a-zA-Z0-9]/g, "-");
    const filename = `${guestName}-${submission.checkin_date}-waivers.zip`;
    return new Response(zipped, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error3) {
    console.error("Error creating zip:", error3);
    return new Response("Error creating zip file: " + error3.message, { status: 500 });
  }
}
__name(handleAdminDownloadAll, "handleAdminDownloadAll");

// src/routes/admin/debug.js
var CACHE_DURATION = 7 * 24 * 60 * 60 * 1e3;
async function handleAdminDebug(request, env2) {
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "true";
  try {
    const debugData = {
      timestamp: Date.now(),
      d1: {}
    };
    const tables = await env2.waivers.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name"
    ).all();
    for (const table3 of tables.results) {
      const tableName = table3.name;
      const countResult = await env2.waivers.prepare(
        `SELECT COUNT(*) as count FROM ${tableName}`
      ).first();
      const rowsResult = await env2.waivers.prepare(
        `SELECT * FROM ${tableName} LIMIT 50`
      ).all();
      debugData.d1[tableName] = {
        count: countResult.count,
        rows: rowsResult.results || []
      };
    }
    return json({
      ok: true,
      lastUpdate: new Date(debugData.timestamp).toISOString(),
      d1: debugData.d1
    });
  } catch (error3) {
    console.error("Debug data error:", error3);
    return json({ ok: false, error: error3.message }, 500);
  }
}
__name(handleAdminDebug, "handleAdminDebug");

// src/routes/admin/api-docs.js
import { join } from "path";
async function handleAdminApiDocs() {
  try {
    const apiDocs = `# API Documentation

This document describes the public API endpoints for the waiver management system.

## Endpoints

### GET /

**Description:** Returns the HTML waiver form for guests to fill out and submit.

**Response:** HTML page with embedded property, activity, and risk data.

**Example:**
\`\`\`bash
curl https://activities.rtxsecured.com/
\`\`\`

---

### POST /submit

**Description:** Submits a completed waiver form with guest information, selected activities, initials, and signature.

**Request Body:**
\`\`\`json
{
  "propertyId": "cabin-13",
  "checkinDate": "2025-10-15",
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "activities": ["kayaking", "ziplining", "archery"],
  "initials": {
    "kayaking": "JD",
    "ziplining": "JD",
    "archery": "JD"
  },
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "accepted": true
}
\`\`\`

**Response (Production Mode):**
\`\`\`json
{
  "ok": true,
  "devMode": false,
  "emailed": [
    "cabin-13_kayaking_20251015.pdf",
    "cabin-13_ziplining_20251015.pdf",
    "cabin-13_archery_20251015.pdf"
  ],
  "pin": "1234"
}
\`\`\`

**Response (Development Mode):**
\`\`\`json
{
  "ok": true,
  "devMode": true,
  "downloads": [
    {
      "filename": "cabin-13_kayaking_20251015.pdf",
      "url": "/download/abc123def456"
    },
    {
      "filename": "cabin-13_ziplining_20251015.pdf",
      "url": "/download/def456ghi789"
    }
  ],
  "pin": "1234"
}
\`\`\`

**Notes:**
- The \`pin\` field is only included if the "archery" activity is selected
- In development mode (\`DEV_MODE=true\`), PDFs are generated and stored but not emailed
- In production mode, PDFs are emailed to the guest's email address

---

### GET /admin/search

**Description:** Search for waiver submissions by guest name or email.

**Query Parameters:**
- \`q\` (required): Search query string

**Response:**
\`\`\`json
{
  "ok": true,
  "results": [...]
}
\`\`\`

---

### GET /status

**Description:** Check the status of a waiver submission by ID.

**Query Parameters:**
- \`id\` (required): Submission ID

**Response:**
\`\`\`json
{
  "ok": true,
  "submission": {...},
  "documents": [...]
}
\`\`\`

---

## Admin Endpoints

### Properties Management

#### GET /admin/properties

List all configured properties.

#### POST /admin/properties/add

Add a new property.

#### POST /admin/properties/remove

Remove a property.

---

### Activities Management

#### GET /admin/activities

Get all activities for a specific property.

**Query Parameters:**
- \`property\` (optional): Property ID

#### POST /admin/activities/add

Add a new activity to a property.

#### POST /admin/activities/update

Update an existing activity.

#### POST /admin/activities/remove

Remove an activity from a property.

---

### Risk Levels Management

#### GET /admin/risks

Get all risk level definitions.

#### POST /admin/risks

Update a risk level definition.

---

### Document Management

#### GET /admin/document

Get document metadata by submission ID and activity.

**Query Parameters:**
- \`submission\` (required): Submission ID
- \`activity\` (required): Activity slug

#### GET /admin/download-all

Download all waiver PDFs for a submission as a ZIP file.

**Query Parameters:**
- \`submission\` (required): Submission ID

---

### Release Management

#### GET /admin/releases

Get all waiver text releases (versioned legal text).

#### POST /admin/releases/create

Create a new waiver text release.

**Request Body:**
\`\`\`json
{
  "version": "1.0.3",
  "waiver_text": "Updated legal waiver text..."
}
\`\`\`

**Notes:**
- If \`version\` is omitted, it will auto-increment from the latest version
- Version must follow semantic versioning format: X.Y.Z
- Version must be unique

---

### Document Verification

#### GET /admin/verify

Verify document integrity by comparing stored hash with computed hash.

**Query Parameters:**
- \`document\` (required): Document ID

**Response:**
\`\`\`json
{
  "ok": true,
  "verified": true,
  "stored_hash": "abc123...",
  "computed_hash": "abc123..."
}
\`\`\`

**Notes:**
- Documents are hashed using SHA-256
- Hash includes: submission data, activity, initials, signature, and release version
- Used to verify documents haven't been tampered with

---

### Debug Panel

#### GET /admin/debug

View KV store and D1 database tables for debugging.

**Query Parameters:**
- \`refresh\` (optional): Set to "true" to force refresh cached data

**Notes:**
- Data is cached for 7 days
- Shows all PROPS_KV keys and values
- Shows all D1 tables with up to 50 rows each
`;
    return new Response(apiDocs, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  } catch (error3) {
    return new Response("Error loading API documentation", { status: 500 });
  }
}
__name(handleAdminApiDocs, "handleAdminApiDocs");

// src/routes/status.js
async function handleStatus(env2) {
  try {
    const dbOK = await env2.waivers.prepare("SELECT 1").first();
    return json({ ok: true, db: !!dbOK, ts: Date.now() });
  } catch (error3) {
    return json({ ok: false, error: error3.message, ts: Date.now() });
  }
}
__name(handleStatus, "handleStatus");

// src/routes/download.js
async function handleDownload(request, env2) {
  const { pathname } = new URL(request.url);
  const r2Key = pathname.replace("/download/", "");
  if (env2.DEV_MODE !== "true") {
    return new Response("Downloads only available in dev mode", { status: 403 });
  }
  const object = await env2.WAIVERS_R2.get(r2Key);
  if (!object) {
    return new Response("PDF not found", { status: 404 });
  }
  const filename = r2Key.split("/").pop();
  return new Response(object.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=300"
    }
  });
}
__name(handleDownload, "handleDownload");

// src/index.js
var src_default = {
  async fetch(request, env2, ctx) {
    const { pathname } = new URL(request.url);
    try {
      if (request.method === "GET" && pathname === "/") return await handleRoot(request, env2);
      if (request.method === "POST" && pathname === "/submit") return await handleSubmit(request, env2);
      if (request.method === "POST" && pathname === "/submit/initial") return await handleInitialSubmit(request, env2);
      if (request.method === "POST" && pathname === "/submit/complete") return await handleCompleteSubmit(request, env2);
      if (request.method === "GET" && pathname === "/admin/search") return await handleAdminSearch(request, env2);
      if (request.method === "GET" && pathname === "/status") return await handleStatus(env2);
      if (request.method === "GET" && pathname === "/admin") return await handleAdmin();
      if (request.method === "GET" && pathname === "/admin/document") return await handleAdminDocument(request, env2);
      if (request.method === "GET" && pathname === "/admin/verify") return await handleAdminVerify(request, env2);
      if (request.method === "GET" && pathname === "/admin/download-all") return await handleAdminDownloadAll(request, env2);
      if (request.method === "GET" && pathname === "/admin/debug") return await handleAdminDebug(request, env2);
      if (request.method === "GET" && pathname === "/admin/api-docs") return await handleAdminApiDocs();
      if ((request.method === "GET" || request.method === "POST") && pathname.startsWith("/admin/releases")) return await handleAdminReleases(request, env2);
      if ((request.method === "GET" || request.method === "POST") && pathname.startsWith("/admin/activities")) return await handleAdminActivities(request, env2);
      if ((request.method === "GET" || request.method === "POST") && pathname.startsWith("/admin/properties")) return await handleAdminProperties(request, env2);
      if ((request.method === "GET" || request.method === "POST") && pathname === "/admin/risks") return await handleAdminRisks(request, env2);
      if (request.method === "GET" && pathname.startsWith("/download/")) return await handleDownload(request, env2);
      return new Response("Not found", { status: 404 });
    } catch (err) {
      console.error(err);
      return new Response("Server error", { status: 500 });
    }
  }
};

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-l3U5iW/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-l3U5iW/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
