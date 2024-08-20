const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const cron = require("node-cron");
const cors = require("cors");
const sendEmail = require("./emailService");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const corsOptions = {
  origin: "https://cfnotifier.vercel.app",
  credentials: true,
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  handle: String,
  lastRating: Number,
  email: String,
});

const User = mongoose.model("User", UserSchema);

app.post("/check-rating", async (req, res) => {
  const { handle, email } = req.body;
  try {
    const response = await axios.get(
      `https://codeforces.com/api/user.rating?handle=${handle}`
    );
    const ratingHistory = response.data.result;
    const latestRating = ratingHistory[ratingHistory.length - 1].newRating;

    const user = await User.findOne({ handle });
    if (user) {
      if (user.lastRating !== latestRating) {
        const ratingDifference = latestRating - user.lastRating;
        user.lastRating = latestRating;
        await user.save();

        await sendEmail(
          user.email,
          "Codeforces Rating Update",
          `Your new rating is ${latestRating}. It changed by ${ratingDifference} points.`
        );
      }
    } else {
      const newUser = new User({ handle, lastRating: latestRating, email });
      await newUser.save();

      await sendEmail(
        email,
        "Rating Update",
        `You have successfully registered for Codeforces rating updates. Your current rating is ${latestRating}.`
      );
    }

    res.json({ message: "Rating checked and updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      desc: { error },
      error: "Error fetching rating data",
    });
  }
});

cron.schedule("0 * * * *", async () => {
  console.log("Running Cron Job: Checking Codeforces ratings");

  const users = await User.find({});
  for (const user of users) {
    try {
      const response = await axios.get(
        `https://codeforces.com/api/user.rating?handle=${user.handle}`
      );
      const ratingHistory = response.data.result;
      const latestRating = ratingHistory[ratingHistory.length - 1].newRating;

      if (user.lastRating !== latestRating) {
        const ratingDifference = latestRating - user.lastRating;
        user.lastRating = latestRating;
        await user.save();

        await sendEmail(
          user.email,
          "Codeforces Rating Update",
          `Your new rating is ${latestRating}. It changed by ${ratingDifference} points.`
        );
      }
    } catch (error) {
      console.error(`Error fetching rating for user ${user.handle}:`, error);
    }
  }
});

