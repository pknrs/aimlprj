import { useEffect, useState } from "react";

const DOG_API = "https://dog.ceo/api/breeds/image/random";
const CAT_API = "https://api.thecatapi.com/v1/images/search";

const Home = () => {
  const [dogUrl, setDogUrl] = useState<string | null>(null);
  const [catUrl, setCatUrl] = useState<string | null>(null);
  const [loadingDog, setLoadingDog] = useState(false);
  const [loadingCat, setLoadingCat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDog = async () => {
    try {
      setError(null);
      setLoadingDog(true);
      const res = await fetch(DOG_API);
      const data = await res.json();
      if (data && data.message) setDogUrl(data.message);
      else throw new Error("Invalid dog response");
    } catch (err: any) {
      setError(err?.message || "Failed to load dog image");
    } finally {
      setLoadingDog(false);
    }
  };

  const fetchCat = async () => {
    try {
      setError(null);
      setLoadingCat(true);
      const res = await fetch(CAT_API);
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.url) setCatUrl(data[0].url);
      else throw new Error("Invalid cat response");
    } catch (err: any) {
      setError(err?.message || "Failed to load cat image");
    } finally {
      setLoadingCat(false);
    }
  };

  useEffect(() => {
    fetchDog();
    fetchCat();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <section className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2">
          Pehchan Kaun?
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Try random dog and cat images — perfect for testing the detector UI.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/60 border border-border rounded-xl p-4 flex flex-col items-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="w-full h-64 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {loadingDog ? (
              <svg
                className="animate-spin h-8 w-8 text-primary-foreground"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : dogUrl ? (
              <img
                src={dogUrl}
                alt="Random dog"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="text-sm text-muted-foreground">No image</div>
            )}
          </div>
        </div>

        <div className="bg-card/60 border border-border rounded-xl p-4 flex flex-col items-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="w-full h-64 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {loadingCat ? (
              <svg
                className="animate-spin h-8 w-8 text-primary-foreground"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : catUrl ? (
              <img
                src={catUrl}
                alt="Random cat"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="text-sm text-muted-foreground">No image</div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 text-center text-sm text-destructive">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default Home;
