import React from 'react';
import Layout from '../components/Layout';
import './PageStyles.css';

function PublicationsPage() {
  return (
    <Layout activeNavItem="publications" className="publications-page">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Công bố khoa học</h1>
          <p className="page-subtitle">Danh sách các bài báo khoa học, sách và tài liệu nghiên cứu đã công bố</p>
        </div>

        <div className="content-sections">
          <section className="content-section">
            <h2>Bài báo khoa học (2024)</h2>
            
            <div className="publication-item">
              <h3>AI-Driven Protein Structure Prediction: A Comprehensive Review</h3>
              <p className="publication-authors">Nguyen Thanh Tai, et al.</p>
              <p className="publication-journal"><em>Journal of Biotechnology and AI</em>, Vol. 15, No. 3, pp. 245-267 (2024)</p>
              <p className="publication-doi">DOI: 10.1234/jbai.2024.03.015</p>
              <p>
                Nghiên cứu tổng quan về việc ứng dụng trí tuệ nhân tạo trong dự đoán cấu trúc protein, 
                đánh giá các phương pháp hiện có và đề xuất hướng phát triển mới.
              </p>
            </div>

            <div className="publication-item">
              <h3>CRISPR-Cas9 Optimization for Therapeutic Gene Editing</h3>
              <p className="publication-authors">Nguyen Thanh Tai, Tran Van A, Le Thi B</p>
              <p className="publication-journal"><em>Nature Biotechnology Vietnam</em>, Vol. 8, No. 2, pp. 89-104 (2024)</p>
              <p className="publication-doi">DOI: 10.1234/nbv.2024.02.008</p>
              <p>
                Phát triển phương pháp tối ưu hóa hệ thống CRISPR-Cas9 để giảm thiểu tác động ngoài mục tiêu 
                trong chỉnh sửa gene điều trị.
              </p>
            </div>
          </section>

          <section className="content-section">
            <h2>Bài báo khoa học (2023)</h2>
            
            <div className="publication-item">
              <h3>Machine Learning Applications in Genomic Analysis</h3>
              <p className="publication-authors">Nguyen Thanh Tai, Pham Van C</p>
              <p className="publication-journal"><em>Bioinformatics and Computational Biology</em>, Vol. 21, No. 4, pp. 156-178 (2023)</p>
              <p className="publication-doi">DOI: 10.1234/bcb.2023.04.021</p>
              <p>
                Ứng dụng machine learning trong phân tích dữ liệu genomic để xác định biomarker 
                và dự đoán khuynh hướng mắc bệnh.
              </p>
            </div>

            <div className="publication-item">
              <h3>Synthetic Biology Approaches to Enzyme Engineering</h3>
              <p className="publication-authors">Nguyen Thanh Tai</p>
              <p className="publication-journal"><em>Vietnamese Journal of Biotechnology</em>, Vol. 19, No. 1, pp. 23-45 (2023)</p>
              <p className="publication-doi">DOI: 10.1234/vjb.2023.01.019</p>
              <p>
                Nghiên cứu về việc ứng dụng sinh học tổng hợp để thiết kế và tối ưu hóa enzyme 
                cho các ứng dụng công nghiệp.
              </p>
            </div>
          </section>

          <section className="content-section">
            <h2>Sách và Chương sách</h2>
            
            <div className="publication-item book">
              <h3>Cẩm nang Công nghệ Sinh học hiện đại</h3>
              <p className="publication-authors">Nguyen Thanh Tai (Tác giả chính)</p>
              <p className="publication-journal">Nhà xuất bản Khoa học và Kỹ thuật, Hà Nội (2024)</p>
              <p className="publication-isbn">ISBN: 978-604-913-XXX-X</p>
              <p>
                Cuốn sách tổng hợp các kiến thức cơ bản và nâng cao về công nghệ sinh học, 
                bao gồm các ứng dụng thực tế và triển vọng phát triển.
              </p>
            </div>

            <div className="publication-item book">
              <h3>"CRISPR Technology in Vietnamese Context" - Chapter 12</h3>
              <p className="publication-authors">Nguyen Thanh Tai</p>
              <p className="publication-journal">Trong: <em>Biotechnology in Southeast Asia</em>, Springer Singapore (2023)</p>
              <p className="publication-isbn">ISBN: 978-981-19-XXXX-X</p>
              <p>
                Chương sách về việc ứng dụng công nghệ CRISPR trong bối cảnh Việt Nam, 
                thách thức và cơ hội phát triển.
              </p>
            </div>
          </section>

          <section className="content-section">
            <h2>Bài thuyết trình tại Hội nghị</h2>
            <div className="conference-list">
              <div className="conference-item">
                <h3>International Conference on Biotechnology 2024</h3>
                <p><strong>Tiêu đề:</strong> "Future of AI in Biotechnology Research"</p>
                <p><strong>Địa điểm:</strong> Singapore, 15-17/03/2024</p>
                <p><strong>Loại:</strong> Keynote Speaker</p>
              </div>
              
              <div className="conference-item">
                <h3>Vietnam Bioinformatics Symposium 2023</h3>
                <p><strong>Tiêu đề:</strong> "Machine Learning for Protein Structure Prediction"</p>
                <p><strong>Địa điểm:</strong> TP. Hồ Chí Minh, 25-27/11/2023</p>
                <p><strong>Loại:</strong> Oral Presentation</p>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Chỉ số trích dẫn</h2>
            <div className="citation-metrics">
              <div className="metric-item">
                <span className="metric-number">45+</span>
                <span className="metric-label">Bài báo đã công bố</span>
              </div>
              <div className="metric-item">
                <span className="metric-number">850+</span>
                <span className="metric-label">Lượt trích dẫn</span>
              </div>
              <div className="metric-item">
                <span className="metric-number">15</span>
                <span className="metric-label">H-index</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default PublicationsPage;