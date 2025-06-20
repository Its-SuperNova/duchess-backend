import DistanceTest from "@/components/distance-test";

export default function DistanceTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Distance Calculation Debug
        </h1>
        <DistanceTest />
      </div>
    </div>
  );
}
