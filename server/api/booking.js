const { Booking } = require('../models/BookingModel');

module.exports.setBooking = async (req, res) => {
  try {
    const { orderId, providerId, customerId, start, end } = req.body;
    if (!orderId) return res.status(404).send('OrderId is required');
    if (!providerId) return res.status(404).send('ProviderID is required');
    if (!customerId) return res.status(404).send('customerID is required');
    if (!start) return res.status(404).send('Booking start is required');
    if (!end) return res.status(404).send('Booking end date is required');
    const result = await Booking.create({ orderId, providerId, customerId, start, end });
    res.status(200).send('Result Saved' + result);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
};

module.exports.getBooking = async (req, res) => {
  try {
    const { providerId, start, end } = req.body;
    if (!providerId) return res.status(404).send('ProviderID is required');
    if (!start) return res.status(404).send('Booking start is required');
    if (!end) return res.status(404).send('Booking end date is required');

    const result = await Booking.find({
      $and: [
        { providerId },
        {
          $or: [
            {
              $and: [
                {
                  start: { $lte: start },
                  end: { $gte: start },
                },
              ],
            },
            {
              $and: [
                {
                  start: { $lte: end },
                  end: { $gte: end },
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
};
module.exports.getAllBooking = async (req, res) => {
  try {
    const result = await Booking.find();

    res.status(200).send('Ok' + result);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
};
module.exports.getProviderBooking = async (req, res) => {
  const { providerId, start, end } = req.body;
  console.log(providerId, start, end);

  try {
    const result = await Booking.find({
      providerId,
      start: { $gte: start },
      end: { $lte: end },
    }).sort({ start: 1 });

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
};
module.exports.deleteBooking = async (req, res) => {
  const result = await Booking.deleteOne(req.body);
  res.status(200).send('Ok');
};
