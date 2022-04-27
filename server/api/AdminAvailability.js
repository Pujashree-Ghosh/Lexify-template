
const { AdminAvailability } = require('../models/SuperAdminAvailabilityModel');
const {getIntegrationSdk} = require("../api-util/sdk");

const integrationSdk=getIntegrationSdk();

module.exports.setAdminAvailability = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(404).send('User ID is required');
    const user = await integrationSdk.users.show({ id: userId });
    if (!user.data.data.attributes.profile.publicData.isSuperAdmin) {
      throw 403;
    }
    const entries = user.data.data.attributes.profile.protectedData.availabilityPlan.entries;
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
    const result = await AdminAvailability.find();
    // AdminAvailability.deleteMany({}, () => {});

    res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(404).send(error);
  }
};
