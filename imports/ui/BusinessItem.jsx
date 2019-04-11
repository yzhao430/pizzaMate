import React, { Component } from "react";
import PropTypes from "prop-types";
import { Message, Button, Checkbox, Form, Modal } from "semantic-ui-react";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Events } from "../api/events.js";
import { Card, Image, List } from "semantic-ui-react";

const inlineStyle = {
  modal: {
    height: 500,
    marginTop: "0px !important",
    marginLeft: "auto",
    display: "inline-block !important",
    marginRight: "auto",
    marginBottom: "50px",
    position: "relative"
  }
};

// This component returns a Card which consists:
// Basic info about current restaurant;
// (TODO) Event info associated with this restaurant
class BusinessItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      peopleLimit: 2,
      appDate: "",
      appTime: "",
      currEvent: null,
      modalOpen: false,
      joinButton: "join",
      joinButtonColor: "red",
      partySizeError: false,
      timeError: false,
      dateError: false,
      formError: false,
      checked: false
    };
    this.getTime = this.getTime.bind(this);
    this.getDate = this.getDate.bind(this);
    this.getRatingImg = this.getRatingImg.bind(this);
    this.displayCategories = this.displayCategories.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // get rating star img src based on the rating number
  getRatingImg(rating) {
    let prefix = "yelp-rating/small_";
    let imgArr = [
      "0.png",
      "1.png",
      "1.png",
      "1_half.png",
      "2.png",
      "2_half.png",
      "3.png",
      "3_half.png",
      "4.png",
      "4_half.png",
      "5.png"
    ];

    let index = 2 * rating;
    return prefix + imgArr[index];
  }

  // return a comma-seperated string of current restaurant's categories
  displayCategories() {
    let res = "";

    let n = this.props.content.categories.length;
    for (let i = 0; i < n; i++) {
      res +=
        i === n - 1
          ? this.props.content.categories[i].title
          : this.props.content.categories[i].title + ", ";
    }

    return res;
  }

  onJoin(myEvent) {
    console.log("join called  " + myEvent._id);

    Meteor.call("events.joinEvent", myEvent, (err, res) => {
      if (err) {
        alert("Error Joining");
        console.log(err);
        return;
      }
      this.setState({ joinButton: "joined!", joinButtonColor: "green" });
      console.log("return from join evt:  " + res);
    });
  }

  renderMyEvents() {
    return this.props.myEvents.map(c => (
      <List.Item key={c._id}>
        <List.Icon name="food" />
        <List.Content>
          {c.peopleLimit + " people @ " + c.appTime}

          {c.isFull ? (
            <Button disabled>Full</Button>
          ) : (
            <Button
              color={this.state.joinButtonColor}
              size="tiny"
              type="button"
              floated="right"
              onClick={() => this.onJoin(c)}
            >
              {this.state.joinButton}
            </Button>
          )}
        </List.Content>
      </List.Item>
    ));
  }
  handleOpen() {
    this.setState({ modalOpen: true });
  }

  handleClose() {
    this.setState({ modalOpen: false });
  }

  getDate() {
    let today = new Date();
    let date = today.getFullYear() + "-";
    let mon =
      today.getMonth() + 1 >= 10
        ? today.getMonth() + 1
        : "0" + (today.getMonth() + 1);

    date += mon;
    date += "-" + today.getDate();
    return date;
  }

  getTime() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    return time;
  }

  handleSubmit() {
    console.log("button clicked-----   " + this.props.content.restaurantName);
    let error = false;

    if (this.state.appTime === "" || this.state.appDate === "") {
      this.setState({ dateError: true });
      error = true;
      console.log("check error 1:   " + error);
    } else if (this.state.appDate < this.getDate()) {
      this.setState({ dateError: true });
      error = true;
      console.log("state date:   " + this.state.appDate);
      console.log("curr date:   " + this.getDate());
      console.log("check error 2:   " + error);
    } else if (
      this.state.appDate == this.getDate() &&
      this.state.appTime < this.getTime()
    ) {
      this.setState({ timeError: true });
      error = true;
      console.log("check error 3:   " + error);
    } else {
      this.setState({ timeError: false, dateError: false });
      error = false || error;
      console.log("check error 4:   " + error);
    }

    if (this.state.peopleLimit < 2 || this.state.peopleLimit > 42) {
      this.setState({ partySizeError: true });
      error = true;
      console.log("check error 5:   " + error);
    } else {
      this.setState({ partySizeError: false });
      error = false || error;
      console.log("check error 6 -- partySize correct:   " + error);
    }

    if (!this.state.checked) {
      error = true;
      console.log("check error 7:   " + error);
    } else {
      error = false || error;
      console.log("check error :  8  -- checked correct" + error);
    }

    console.log("form error state after validation:" + error);
    ///check if still has error
    if (error) {
      console.log("formError----");
      this.setState({ formError: true });
      return;
    } else {
      console.log("Clean----");
      this.setState({ formError: false });
    }

    Meteor.call(
      "events.createNewEvent",
      this.props.content,
      this.state.peopleLimit,
      this.state.appDate + " " + this.state.appTime,
      (err, res) => {
        if (err) {
          console.log("Error calling createEvent    " + err);
          return;
        }

        console.log("return res:    " + JSON.stringify(res));
      }
    );
    this.handleClose();
  }

  render() {
    return (
      <Card fluid>
        <Card.Content>
          <Card.Header>
            <span>powered by</span>
            <Image
              src={"imgs/Yelp_trademark_RGB.png"}
              alt="yelp-logo-img"
              height="30%"
              width="30%"
              href="https://www.yelp.com/"
            />
          </Card.Header>
        </Card.Content>
        <Card.Content>
          <Image
            src={this.props.content.image_url}
            alt="restaurant-profile-img"
            height="60%"
            width="60%"
          />

          <List className="list-group list-group-flush">
            <List.Item>
              <a href={this.props.content.url}>{this.props.content.name}</a>
            </List.Item>
            <List.Item>
              <img
                src={this.getRatingImg(this.props.content.rating)}
                alt="rating"
              />
              &nbsp;
              <span>{this.props.content.review_count + " reviews"}</span>
            </List.Item>
            <List.Item>Categories: {this.displayCategories()}</List.Item>
            <List.Item>Price: {this.props.content.price}</List.Item>
            <List.Item>
              Location: {this.props.content.location.display_address}
            </List.Item>
            <List.Item>Phone: {this.props.content.display_phone}</List.Item>
            <div className="ui divider" />
            {this.renderMyEvents()}
            {this.props.myEvents.length === 0 ? (
              <div />
            ) : (
              <div className="ui divider" />
            )}

            <List.Item>
              <Modal
                trigger={
                  <Button size="small" onClick={this.handleOpen} primary>
                    Create New Event
                  </Button>
                }
                open={this.state.modalOpen}
                onClose={this.handleClose}
                style={inlineStyle.modal}
                size="tiny"
                closeIcon
              >
                <Modal.Header>Create Your Event</Modal.Header>
                <Modal.Content>
                  <Form size={"tiny"} error={this.state.formError}>
                    {this.state.formError ? (
                      <Message negative>
                        <Message.Header>Sorry</Message.Header>
                        <p>That offer has expired</p>
                      </Message>
                    ) : null}
                    <Form.Field required>
                      <Form.Input
                        required
                        label="Date to Eat"
                        type="date"
                        value={this.state.appDate}
                        onChange={e =>
                          this.setState({ appDate: e.target.value })
                        }
                        error={this.state.dateError}
                      />
                    </Form.Field>
                    <Form.Field required>
                      <Form.Input
                        required
                        label="Time to Eat"
                        type="time"
                        value={this.state.appTime}
                        onChange={e =>
                          this.setState({ appTime: e.target.value })
                        }
                        error={this.state.timeError}
                      />
                    </Form.Field>
                    <Form.Field required>
                      <Form.Input
                        required
                        label="Party Size Limit"
                        type="number"
                        min={2}
                        max={42}
                        value={this.state.peopleLimit}
                        placeholder="Party Size Limit"
                        onChange={e =>
                          this.setState({ peopleLimit: e.target.value })
                        }
                        error={this.state.partySizeError}
                      />
                    </Form.Field>
                    <Form.Field required>
                      <Checkbox
                        required
                        label="I agree to share food with new friends and have a good time"
                        onChange={() =>
                          this.setState({
                            checked: !this.state.checked
                          })
                        }
                      />
                    </Form.Field>
                    <Button
                      positive
                      type="submit"
                      disabled={
                        !this.state.appDate ||
                        !this.state.appTime ||
                        !this.state.peopleLimit ||
                        !this.state.checked
                      }
                      onClick={this.handleSubmit.bind(this)}
                    >
                      Submit
                    </Button>
                  </Form>
                </Modal.Content>
              </Modal>
            </List.Item>
          </List>
        </Card.Content>
      </Card>
    );
  }
}

BusinessItem.propTypes = {
  content: PropTypes.object.isRequired,
  myEvents: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default withTracker(props => {
  // TODO: error subscribing using props
  Meteor.subscribe("restaurantEvents", props.content);

  return {
    myEvents: Events.find({ restaurantId: props.content.id }).fetch()
  };
})(BusinessItem);
