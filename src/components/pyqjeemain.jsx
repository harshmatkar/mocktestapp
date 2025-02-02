import React, { useState } from "react";
import { X } from "lucide-react"; // Importing the cross icon from lucide-react
import { useRouter } from "next/router"; // For navigation

const PYQPage = () => {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedChapter, setSelectedChapter] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  const subjects = {
    Mathematics: ["Integration", "Differentiation", "Vectors"],
    Physics: ["Mechanics", "Optics", "Thermodynamics"],
  };

  const years = ["All", "2023", "2022", "2021", "2020"];

  const questions = [
    {
      id: 1,
      subject: "Mathematics",
      chapter: "Integration",
      year: "2023",
      question: "∫(x²+1)dx",
      options: [
        "x³/3 + x + C",
        "x³/3 + 2x + C",
        "x³ + x + C",
        "x³/3 - x + C",
      ],
      correctAnswer: 0,
      explanation:
        "The integral of x² is x³/3, and the integral of 1 is x. Add C for the constant of integration.",
    },
  ];

  const filteredQuestions = questions.filter((q) => {
    return (
      (selectedSubject === "All" || q.subject === selectedSubject) &&
      (selectedChapter === "All" || q.chapter === selectedChapter) &&
      (selectedYear === "All" || q.year === selectedYear)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top Bar with Title & Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Previous Year Questions
          </h1>
          <button
            onClick={() => router.push("/dashboard")} // Change to your dashboard route
            className="text-gray-400 hover:text-white transition-all"
          >
            <X size={28} />
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 shadow-2xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter("All");
                }}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Subjects</option>
                {Object.keys(subjects).map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Chapter
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedSubject || selectedSubject === "All"}
              >
                <option value="All">All Chapters</option>
                {selectedSubject !== "All" &&
                  subjects[selectedSubject].map((chapter) => (
                    <option key={chapter} value={chapter}>
                      {chapter}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              No questions found matching the selected filters
            </div>
          ) : (
            filteredQuestions.map((q, index) => (
              <div
                key={q.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg hover:border-blue-500 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <span className="text-blue-400 font-mono text-lg">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-baseline gap-3">
                      <p className="text-xl font-semibold">{q.question}</p>
                      <span className="text-sm text-gray-400 ml-auto">
                        {q.year} • {q.chapter}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors cursor-pointer group"
                        >
                          <span className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-600 group-hover:bg-blue-500 transition-colors">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span>{option}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-blue-400 font-medium mb-2">
                        Explanation
                      </p>
                      <p className="text-gray-300">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PYQPage;
