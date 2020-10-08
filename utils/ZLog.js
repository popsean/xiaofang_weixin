const DEBUG = true;
export default {
  log(str) {
    if (DEBUG) {
      console.log(str);
    }
  },
  err(str) {
    if (DEBUG) {
      console.error(str);
    }
  },
  warn(str) {
    if (DEBUG) {
      console.warn(str);
    }
  }
};
