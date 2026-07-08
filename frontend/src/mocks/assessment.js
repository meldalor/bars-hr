export const QUESTION_HINT =
    "Что предполагает ответ на вопрос";

export function getAssessment(vacancy) {
    if (vacancy && vacancy.assessment) {
        return {
            questions: vacancy.assessment.questions.map((question) => ({ ...question })),
            matrix: {
                hard: vacancy.assessment.matrix.hard.map((item) => ({ ...item })),
                soft: vacancy.assessment.matrix.soft.map((item) => ({ ...item })),
                culture: vacancy.assessment.matrix.culture.map((item) => ({ ...item })),
            },
        };
    }

    return {
        questions: [],
        matrix: { hard: [], soft: [], culture: [] },
    };
}
