const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const { AdminAvailability } = require('../models/SuperAdminAvailabilityModel');
const integrationSdk = flexIntegrationSdk.createInstance({
  clientId: '66ce8e58-5769-4f62-81d7-19073cfab535',
  clientSecret: '73f5d2b697f7a9aa9372c8a601826c37cabbbab7',
});

module.exports.setAdminAvailability = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(404).send('User ID is required');
    const user = await integrationSdk.users.show({ id: userId });
    if (!user.data.data.attributes.profile.publicData.isSuperAdmin) {
      throw 403;
    }
    const entries = user.data.data.attributes.profile.protectedData.availabilityPlan.entries;
    console.log(entries);

    const result = await AdminAvailability.findOneAndUpdate(
      { userId },
      { userId, entries },
      { upsert: true }
    );
    res.status(200).send(entries);
  } catch (error) {
    return res.status(404).send(error);
  }
};

module.exports.getAdminAvailability = async (req, res) => {
  try {
    // const id = req.params.id;
    // if (!id) return res.status(404).send('User ID is required');
    // //   if (!start) return res.status(404).send('Booking start is required');
    // //   if (!end) return res.status(404).send('Booking end date is required');
    // console.log(new Date());

    const result = await AdminAvailability.find();
    // AdminAvailability.deleteMany({}, () => {});

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
};
