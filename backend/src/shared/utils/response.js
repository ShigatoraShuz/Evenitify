function sendSuccess(res, data, meta) {
  return res.status(200).json({ success: true, data, meta: meta || {} });
}

function sendCreated(res, data) {
  return res.status(201).json({ success: true, data, meta: {} });
}

function sendNoContent(res) {
  return res.status(204).send();
}

module.exports = { sendSuccess, sendCreated, sendNoContent };
