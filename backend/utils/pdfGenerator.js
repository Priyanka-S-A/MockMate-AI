import PDFDocument from 'pdfkit';

export const generatePDFReport = (interview, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Stream directly to the response
  doc.pipe(res);

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
  const typeText = interview.type === 'company' && interview.companyName
    ? `Company: ${interview.companyName}   |   `
    : interview.type === 'resume'
      ? `Type: Resume-Based   |   `
      : '';

  doc
    .fillColor(blackColor)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(typeText, { continued: true })
    .text(`Domain: `, { continued: true })
    .font('Helvetica')
    .text(`${interview.domain}   |   `, { continued: true })
    .font('Helvetica-Bold')
    .text(`Difficulty: `, { continued: true })
    .font('Helvetica')
    .text(`${interview.difficulty}   |   `, { continued: true })
    .font('Helvetica-Bold')
    .text(`Status: `, { continued: true })
    .font('Helvetica')
    .text(`${interview.status.toUpperCase()}`);

  doc
    .fillColor(lightGray)
    .font('Helvetica')
    .fontSize(9)
    .text(`Date taken: ${new Date(interview.createdAt).toLocaleString()}  |  Time Taken: ${Math.floor(interview.timeTaken / 60)}m ${interview.timeTaken % 60}s`)
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
    .text(`${interview.scores.overall}/100`, 70, scoresY + 15);

  doc
    .fillColor(darkGray)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('TECHNICAL', 200, scoresY)
    .fillColor('#8b5cf6')
    .fontSize(18)
    .text(`${interview.scores.technicalKnowledge}/100`, 200, scoresY + 15);

  doc
    .fillColor(darkGray)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('COMMUNICATION', 330, scoresY)
    .fillColor('#3b82f6')
    .fontSize(18)
    .text(`${interview.scores.communicationScore}/100`, 330, scoresY + 15);

  doc
    .fillColor(darkGray)
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('ACCURACY RATE', 460, scoresY)
    .fillColor('#06b6d4')
    .fontSize(18)
    .text(`${interview.scores.accuracy}%`, 460, scoresY + 15);

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
    
  (interview.summary.strongAreas || []).forEach(area => {
    doc
      .fillColor(darkGray)
      .font('Helvetica')
      .fontSize(9.5)
      .text(`• ${area}`, 60);
  });

  doc.y = startY;
  
  doc
    .fillColor('#b91c1c')
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('WEAK AREAS:', 300, startY);
    
  (interview.summary.weakAreas || []).forEach(area => {
    doc
      .fillColor(darkGray)
      .font('Helvetica')
      .fontSize(9.5)
      .text(`• ${area}`, 310);
  });

  doc.y = Math.max(doc.y, startY) + 30;
  doc.moveDown(1.5);


  doc
    .fillColor(blackColor)
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('Learning Roadmap:', 50, doc.y)
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor(darkGray)
    .text(interview.summary.learningRoadmap)
    .moveDown(2);

  // Questions breakdown page break if needed
  doc.addPage();

  doc
    .fillColor(goldColor)
    .font('Helvetica-Bold')
    .fontSize(16)
    .text('Question Evaluations')
    .moveDown(1.5);

  interview.questions.forEach((q, index) => {
    doc
      .fillColor(blackColor)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`Q${index + 1}: ${q.questionText}`)
      .moveDown(0.4);

    doc
      .fillColor(lightGray)
      .font('Helvetica-Oblique')
      .fontSize(9.5)
      .text('Candidate Answer:')
      .fillColor(darkGray)
      .font('Helvetica')
      .text(q.userAnswerText || '[Question Skipped]')
      .moveDown(0.6);

    if (q.status === 'answered' && q.evaluation) {
      doc
        .fillColor(goldColor)
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`Score: ${q.evaluation.score}/10   |   Technical Accuracy: ${q.evaluation.technicalAccuracy}`)
        .moveDown(0.4);

      if (q.evaluation.strengths?.length) {
        doc
          .fillColor(blackColor)
          .font('Helvetica-Bold')
          .fontSize(9)
          .text('Strengths: ', { continued: true })
          .font('Helvetica')
          .fillColor(darkGray)
          .text(q.evaluation.strengths.join(', '))
          .moveDown(0.2);
      }

      if (q.evaluation.weaknesses?.length) {
        doc
          .fillColor(blackColor)
          .font('Helvetica-Bold')
          .fontSize(9)
          .text('Weaknesses: ', { continued: true })
          .font('Helvetica')
          .fillColor(darkGray)
          .text(q.evaluation.weaknesses.join(', '))
          .moveDown(0.2);
      }

      if (q.evaluation.suggestions) {
        doc
          .fillColor(blackColor)
          .font('Helvetica-Bold')
          .fontSize(9)
          .text('Suggestions: ', { continued: true })
          .font('Helvetica')
          .fillColor(darkGray)
          .text(q.evaluation.suggestions)
          .moveDown(0.2);
      }

      if (q.aiModelAnswer) {
        doc
          .fillColor(blackColor)
          .font('Helvetica-Bold')
          .fontSize(9)
          .text('Ideal Answer: ', { continued: true })
          .font('Helvetica')
          .fillColor(darkGray)
          .text(q.aiModelAnswer)
          .moveDown(0.2);
      }
    } else {
      doc
        .fillColor(lightGray)
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text('Status: Skipped or not answered.');
    }

    doc.moveDown(2);
  });

  // End doc
  doc.end();
};
