const router = require("express").Router();

const flightsRouter = require("./flights");
const purchaseRouter = require("./purchase");
const receiptRouter = require("./receipt");
const bookRouter = require("./book");
const bookedRouter = require("./booked");
const authRouter = require("./auth");
const homeRouter = require("./home");
const chatRouter = require("./chat");
const airportsApiRouter = require("./airports.api");

router.use("/book/flights", flightsRouter);
router.use("/book/purchase", purchaseRouter);
router.use("/book/receipt", receiptRouter);
router.use("/book", bookRouter);
router.use("/booked", bookedRouter);
router.use("/login", authRouter);
router.use("/logout", authRouter);
router.use("/api/chat", chatRouter);
router.use("/api/airports", airportsApiRouter);
router.use("/", homeRouter);

module.exports = router;
