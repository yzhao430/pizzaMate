/* eslint-disable no-undef */
import { Meteor } from "meteor/meteor";
import "../imports/api/events.js";
import "../imports/api/messages.js";
import "../imports/api/methods.js";
import { WebApp } from "meteor/webapp";

WebApp.addHtmlAttributeHook(() => ({ lang: "en" }));

const LISTS_METHODS = [
  "searchYelp",
  "getYelpDetail",
  "getMapToken",
  "sendConfirmationEmail",
  "sendExpirationEmail",
  "events.createNewEvent",
  "events.joinEvent",
  "events.leaveEvent",
  "events.booking",
  "events.booked",
  "events.expire",
  "events.remove",
  "events.bookingFailed",
  "events.vote",
  "messages.sendMessage"
];

if (Meteor.isServer) {
  DDPRateLimiter.addRule(
    {
      name(name) {
        return LISTS_METHODS.includes(name);
      },

      // Rate limit per connection ID
      connectionId() {
        return true;
      }
    },
    4,
    1000
  );
}
const emailPass = Meteor.settings.email.password;
Meteor.startup(() => {
  /* Uncomment lines below when reservation feature is complete */
  process.env.MAIL_URL =
    "smtps://pizzamate.usa@gmail.com:" + emailPass + "@smtp.gmail.com:465/";
});
