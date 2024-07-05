import chai from 'chai';
const expect = chai.expect; // Accessing expect from Chai's default expor
import { searchAxs, getEvent } from './helpers.js';
import { parseEvent } from './parser.js';
import { describe } from 'mocha';
describe('axs scraper', () => {
  it('should search axs', () => {
    return searchAxs('bob-the-drag-queen-tickets')
      .then(res => {
        expect(res).to.be.ok;
        console.log(res);
      });
  });

  it('should get event', () => {
    let eventUrl = '/events/564913/bob-the-drag-queen-tickets';
    return getEvent(eventUrl)
      .then(res => {
        expect(res).to.be.ok;
        console.log(res);
      });
  });

  it('should parse event', () => {
    let eventUrl = '/events/564913/bob-the-drag-queen-tickets';
    return getEvent(eventUrl)
      .then(parseEvent)
      .then(res => {
        console.log(res);
      });
  });
});
