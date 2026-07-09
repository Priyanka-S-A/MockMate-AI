import PDFDocument from 'pdfkit';

/**
 * Generates a PDF report buffer for an interview.
 * Completely robust to missing, null, or undefined fields.
 * Returns a Promise that resolves to a Buffer.
 */
export const generatePDFReport = (interview) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', (err) => {
        reject(err);
      });

      // Extract safe fields with fallbacks
      const type = interview.type || 'standard';
      const companyName = interview.companyName || '';
      const domain = interview.domain || 'N/A';
      const difficulty = interview.difficulty || 'Intermediate';
      const status = interview.status || 'ongoing';
      
      const createdAtDate = interview.createdAt ? new Date(interview.createdAt) : new Date();
      const dateStr = isNaN(createdAtDate.getTime()) ? 'N/A' : createdAtDate.toLocaleString();
      
      const timeTaken = typeof interview.timeTaken === 'number' ? interview.timeTaken : 0;
      const timeTakenStr = `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`;

      const scores = interview.scores || {};
      const overallScore = typeof scores.overall === 'number' ? scores.overall : 0;
      const technicalKnowledge = typeof scores.technicalKnowledge === 'number' ? scores.technicalKnowledge : 0;
      const communicationScore = typeof scores.communicationScore === 'number' ? scores.communicationScore : 0;
      const accuracy = typeof scores.accuracy === 'number' ? scores.accuracy : 0;

      const summary = interview.summary || {};
      const strongAreas = Array.isArray(summary.strongAreas) ? summary.strongAreas : [];
      const weakAreas = Array.isArray(summary.weakAreas) ? summary.weakAreas : [];
      const learningRoadmap = summary.learningRoadmap || 'No learning roadmap generated.';

      const questions = Array.isArray(interview.questions) ? interview.questions : [];

      // Colors
      const goldColor = '#c5a030';
      const darkGray = '#333333';
      const lightGray = '#777777';
      const blackColor = '#111111';

      // Title / Brand Header
      doc
        .fillColor(goldColor)
        .font('Helvetica-Bold')
        .fontSize(22)
        .text('MOCKMATE AI — MOCK INTERVIEW REPORT', { tracking: 1 });
        
      doc
        .fillColor(lightGray)
        .font('Helvetica')
        .fontSize(10)
        .text('PERFORMANCE GRADED SUMMARY REPORT')
        .moveDown(1.5);

      // Horizontal separator
      doc
        .strokeColor(goldColor)
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown(1);

      // Meta info section
      const typeText = type === 'company' && companyName
        ? `Company: ${companyName}   |   `
        : type === 'resume'
          ? `Type: Resume-Based   |   `
          : '';

      doc
        .fillColor(blackColor)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text(typeText, { continued: true })
        .text(`Domain: `, { continued: true })
        .font('Helvetica')
        .text(`${domain}   |   `, { continued: true })
        .font('Helvetica-Bold')
        .text(`Difficulty: `, { continued: true })
        .font('Helvetica')
        .text(`${difficulty}   |   `, { continued: true })
        .font('Helvetica-Bold')
        .text(`Status: `, { continued: true })
        .font('Helvetica')
        .text(`${status.toUpperCase()}`);

      doc
        .fillColor(lightGray)
        .font('Helvetica')
        .fontSize(9)
        .text(`Date taken: ${dateStr}  |  Time Taken: ${timeTakenStr}`)
        .moveDown(1.5);

      // Scores section card
      doc
        .rect(50, doc.y, 495, 65)
        .fill('#f9f9f9')
        .stroke('#e0e0e0');

      const scoresY = doc.y + 15;
      
      doc
        .fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('OVERALL SCORE', 70, scoresY)
        .fillColor(goldColor)
        .fontSize(18)
        .text(`${overallScore}/100`, 70, scoresY + 15);

      doc
        .fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('TECHNICAL', 200, scoresY)
        .fillColor('#8b5cf6')
        .fontSize(18)
        .text(`${technicalKnowledge}/100`, 200, scoresY + 15);

      doc
        .fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('COMMUNICATION', 330, scoresY)
        .fillColor('#3b82f6')
        .fontSize(18)
        .text(`${communicationScore}/100`, 330, scoresY + 15);

      doc
        .fillColor(darkGray)
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('ACCURACY RATE', 460, scoresY)
        .fillColor('#06b6d4')
        .fontSize(18)
        .text(`${accuracy}%`, 460, scoresY + 15);

      doc.y = scoresY + 55;
      doc.moveDown(2);

      // Strong & Weak Areas
      doc
        .fillColor(blackColor)
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('MockMate AI — Interview Feedback Summary')
        .moveDown(0.8);

      const startY = doc.y;
      
      doc
        .fillColor('#047857')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('STRONG AREAS:', 50, startY);
        
      if (strongAreas.length === 0) {
        doc
          .fillColor(darkGray)
          .font('Helvetica-Oblique')
          .fontSize(9.5)
          .text('None noted', 60);
      } else {
        strongAreas.forEach(area => {
          if (area) {
            doc
              .fillColor(darkGray)
              .font('Helvetica')
              .fontSize(9.5)
              .text(`• ${area}`, 60);
          }
        });
      }

      const leftColBottomY = doc.y;

      doc.y = startY;
      
      doc
        .fillColor('#b91c1c')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('WEAK AREAS:', 300, startY);
        
      if (weakAreas.length === 0) {
        doc
          .fillColor(darkGray)
          .font('Helvetica-Oblique')
          .fontSize(9.5)
          .text('None noted', 310);
      } else {
        weakAreas.forEach(area => {
          if (area) {
            doc
              .fillColor(darkGray)
              .font('Helvetica')
              .fontSize(9.5)
              .text(`• ${area}`, 310);
          }
        });
      }

      doc.y = Math.max(leftColBottomY, doc.y, startY) + 15;
      doc.moveDown(1.5);

      doc
        .fillColor(blackColor)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('Learning Roadmap:', 50, doc.y)
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(darkGray)
        .text(learningRoadmap)
        .moveDown(2);

      // Questions breakdown page break if needed
      doc.addPage();

      doc
        .fillColor(goldColor)
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('Question Evaluations')
        .moveDown(1.5);

      questions.forEach((q, index) => {
        const qText = q.questionText || 'N/A';
        const userAnswerText = q.userAnswerText || '[Question Skipped]';
        const qStatus = q.status || 'pending';
        const evaluation = q.evaluation || null;

        doc
          .fillColor(blackColor)
          .font('Helvetica-Bold')
          .fontSize(11)
          .text(`Q${index + 1}: ${qText}`)
          .moveDown(0.4);

        doc
          .fillColor(lightGray)
          .font('Helvetica-Oblique')
          .fontSize(9.5)
          .text('Candidate Answer:')
          .fillColor(darkGray)
          .font('Helvetica')
          .text(userAnswerText)
          .moveDown(0.6);

        if (qStatus === 'answered' && evaluation) {
          const score = typeof evaluation.score === 'number' ? evaluation.score : 0;
          const accuracyVal = evaluation.technicalAccuracy || 'N/A';
          const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
          const weaknesses = Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : [];
          const suggestions = evaluation.suggestions || '';
          const aiModelAnswer = q.aiModelAnswer || '';

          doc
            .fillColor(goldColor)
            .font('Helvetica-Bold')
            .fontSize(10)
            .text(`Score: ${score}/10   |   Technical Accuracy: ${accuracyVal}`)
            .moveDown(0.4);

          if (strengths.length > 0) {
            doc
              .fillColor(blackColor)
              .font('Helvetica-Bold')
              .fontSize(9)
              .text('Strengths: ', { continued: true })
              .font('Helvetica')
              .fillColor(darkGray)
              .text(strengths.join(', '))
              .moveDown(0.2);
          }

          if (weaknesses.length > 0) {
            doc
              .fillColor(blackColor)
              .font('Helvetica-Bold')
              .fontSize(9)
              .text('Weaknesses: ', { continued: true })
              .font('Helvetica')
              .fillColor(darkGray)
              .text(weaknesses.join(', '))
              .moveDown(0.2);
          }

          if (suggestions) {
            doc
              .fillColor(blackColor)
              .font('Helvetica-Bold')
              .fontSize(9)
              .text('Suggestions: ', { continued: true })
              .font('Helvetica')
              .fillColor(darkGray)
              .text(suggestions)
              .moveDown(0.2);
          }

          if (aiModelAnswer) {
            doc
              .fillColor(blackColor)
              .font('Helvetica-Bold')
              .fontSize(9)
              .text('Ideal Answer: ', { continued: true })
              .font('Helvetica')
              .fillColor(darkGray)
              .text(aiModelAnswer)
              .moveDown(0.2);
          }
        } else {
          doc
            .fillColor(lightGray)
            .font('Helvetica-Bold')
            .fontSize(9.5)
            .text(`Status: ${qStatus.toUpperCase()} or not evaluated.`);
        }

        doc.moveDown(2);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
