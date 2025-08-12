import '@testing-library/jest-dom';

const { TextDecoder, TextEncoder } = require('util');
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

// Polyfill fetch API globals if your API handlers use fetch, Request, Response, Headers
const fetch = require('node-fetch');

global.fetch = fetch;
global.Request = fetch.Request;
global.Response = fetch.Response;
global.Headers = fetch.Headers;
