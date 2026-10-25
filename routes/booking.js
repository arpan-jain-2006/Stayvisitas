const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controller/booking.js");

// Book a listing (Standard Pay on Arrival)
router.post("/listing/:id/book", isLoggedIn, wrapAsync(bookingController.createBooking));

// Razorpay Payment Integration
router.post("/listing/:id/create-razorpay-order", isLoggedIn, wrapAsync(bookingController.createRazorpayOrder));
router.post("/listing/:id/verify-payment", isLoggedIn, wrapAsync(bookingController.verifyRazorpayPayment));

// Contact Host
router.post("/listing/:id/contact-host", isLoggedIn, wrapAsync(bookingController.contactHost));

// View Wishlist
router.get("/wishlist", wrapAsync(bookingController.renderWishlist));

// View user's trips / bookings
router.get("/my-bookings", isLoggedIn, wrapAsync(bookingController.getMyBookings));
router.get("/bookings", isLoggedIn, (req, res) => res.redirect("/my-bookings"));

// View specific booking confirmation & receipt
router.get("/bookings/:id", isLoggedIn, wrapAsync(bookingController.getBookingDetails));

// Cancel a booking
router.post("/bookings/:id/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));
router.delete("/bookings/:id", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;

