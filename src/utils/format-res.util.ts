const formatRes = (message: string, data?: any) => {
  return {
    success: true,
    message,
    data: data || null,
  };
};

export default formatRes;
