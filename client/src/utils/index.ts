// Get the query params off the window's URL
export const getHashParams = () => {
  const hashParams = {} as any;
  let e;
  const r = /([^&;=]+)=?([^&;]*)/g;
  const q = window.location.hash.substring(1);
  console.log(`HASH - ${JSON.stringify(window.location)}`);

  while ((e = r.exec(q))) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  console.log(`HASH - ${JSON.stringify(hashParams)}`);
  return hashParams;
};

// Higher-order function for async/await error handling
export const catchErrors = (fn: any) => {
  return function (...args: any) {
    return fn(...args).catch((err: any) => {
      console.error(err);
    });
  };
};

// Add something to localstorage
export const cache = (key: any, value: any) =>
  window.localStorage.setItem(key, value);

// Pull something off of localstorage
export const cached = (key: any) => window.localStorage.getItem(key);
