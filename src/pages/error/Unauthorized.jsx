const Unauthorized = () => {
  return (
    <div className="h-screen flex items-center justify-center text-center bg-base-200">
      <div>
        <h1 className="text-4xl font-bold text-error">403 - Unauthorized</h1>
        <p className="mt-2 text-lg">You don't have permission to view this page.</p>
      </div>
    </div>
  );
};

export default Unauthorized;
