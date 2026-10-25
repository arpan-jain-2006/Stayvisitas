const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    totalNights: {
        type: Number,
        required: true,
        min: 1
    },
    guests: {
        adults: {
            type: Number,
            default: 1,
            min: 1
        },
        children: {
            type: Number,
            default: 0,
            min: 0
        },
        infants: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    totalGuests: {
        type: Number,
        default: 1
    },
    nightlyPrice: {
        type: Number,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    cleaningFee: {
        type: Number,
        default: 0
    },
    serviceFee: {
        type: Number,
        default: 0
    },
    taxes: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    guestName: {
        type: String,
        default: ""
    },
    guestEmail: {
        type: String,
        default: ""
    },
    guestPhone: {
        type: String,
        default: ""
    },
    paymentMethod: {
        type: String,
        default: "Pay on Arrival"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Pay on Arrival", "Failed"],
        default: "Pay on Arrival"
    },
    razorpayOrderId: {
        type: String,
        default: ""
    },
    razorpayPaymentId: {
        type: String,
        default: ""
    },
    razorpaySignature: {
        type: String,
        default: ""
    },
    specialRequests: {

        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Confirmed", "Cancelled", "Completed"],
        default: "Confirmed"
    },
    bookingReference: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate booking reference before saving if not present
bookingSchema.pre("save", function(next) {
    if (!this.bookingReference) {
        const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.bookingReference = "SV-" + rand;
    }
    next();
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
