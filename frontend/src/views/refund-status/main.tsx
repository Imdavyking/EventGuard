const mockRefunds = [
  {
    id: "1",
    event: "Sunset Festival",
    date: "2025-05-12",
    condition: "Heavy Rain (15mm)",
    refunded: true,
    amount: "40 USDT",
  },
  {
    id: "2",
    event: "Open Air Cinema",
    date: "2025-06-01",
    condition: "Clear",
    refunded: false,
    amount: "0 USDT",
  },
];

const RefundStatus = () => {
  return (
    <>
      <h2 className="text-3xl font-bold mb-6">💸 Refund Status</h2>

      <div className="space-y-4">
        {mockRefunds.map((refund) => (
          <div
            key={refund.id}
            className="border p-4 rounded-xl shadow-sm bg-white hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{refund.event}</h3>
                <p className="text-sm text-gray-500">{refund.date}</p>
                <p className="text-sm text-gray-600">
                  Condition: {refund.condition}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    refund.refunded ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {refund.refunded ? `Refunded: ${refund.amount}` : "No Refund"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RefundStatus;
