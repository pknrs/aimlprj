
const Home = () => {
  return (
    <div className="text-center">
      <section className="bg-gray-800 p-8 rounded-lg">
        <h1 className="text-5xl font-bold mb-4">Pehchan Kaun?</h1>
        <p className="text-lg text-gray-400">
          Upload an image and see the magic of YOLOv8 object detection.
        </p>
        <img src="https://images.unsplash.com/photo-1583217803809-6161b402720c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Hero" className="mt-8 mx-auto rounded-lg" />
      </section>
    </div>
  );
};

export default Home;
