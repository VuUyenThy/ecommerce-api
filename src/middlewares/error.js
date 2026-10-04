function notFound(req, res) {
  res.status(404).json({ message: 'Không tìm thấy đường dẫn' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Lỗi hệ thống' : err.message,
  });
}

module.exports = { notFound, errorHandler };
