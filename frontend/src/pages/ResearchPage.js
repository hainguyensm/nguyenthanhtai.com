import React from 'react';
import Layout from '../components/Layout';
import './PageStyles.css';

function ResearchPage() {
  return (
    <Layout activeNavItem="research">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Nghiên cứu</h1>
          <p className="page-subtitle">Các dự án nghiên cứu và phát triển trong lĩnh vực Công nghệ Sinh học</p>
        </div>

        <div className="content-sections">
          <section className="content-section">
            <h2>Dự án nghiên cứu hiện tại</h2>
            
            <div className="research-item">
              <h3>Ứng dụng AI trong Sinh học phân tử</h3>
              <p className="research-status">Đang thực hiện (2024-2025)</p>
              <p>
                Nghiên cứu việc ứng dụng trí tuệ nhân tạo để phân tích và dự đoán cấu trúc protein, 
                tối ưu hóa quá trình phát hiện thuốc mới và cải thiện hiệu quả điều trị.
              </p>
              <ul>
                <li>Phát triển algorithm machine learning cho dự đoán tương tác protein</li>
                <li>Ứng dụng deep learning trong phân tích dữ liệu genomic</li>
                <li>Tạo ra công cụ hỗ trợ thiết kế thuốc thông minh</li>
              </ul>
            </div>

            <div className="research-item">
              <h3>Công nghệ CRISPR trong chỉnh sửa gene</h3>
              <p className="research-status">Đang thực hiện (2023-2024)</p>
              <p>
                Nghiên cứu và phát triển các phương pháp chỉnh sửa gene chính xác sử dụng công nghệ CRISPR-Cas9 
                để điều trị các bệnh di truyền hiếm gặp.
              </p>
              <ul>
                <li>Tối ưu hóa hiệu quả cắt của CRISPR</li>
                <li>Giảm thiểu tác động ngoài mục tiêu</li>
                <li>Phát triển hệ thống vector delivery an toàn</li>
              </ul>
            </div>
          </section>

          <section className="content-section">
            <h2>Lĩnh vực nghiên cứu</h2>
            <div className="research-areas">
              <div className="area-item">
                <h3>Sinh học phân tử</h3>
                <p>Nghiên cứu cơ chế hoạt động của các phân tử sinh học ở mức độ phân tử</p>
              </div>
              <div className="area-item">
                <h3>Bioinformatics</h3>
                <p>Ứng dụng công nghệ thông tin để phân tích và xử lý dữ liệu sinh học</p>
              </div>
              <div className="area-item">
                <h3>Enzyme Engineering</h3>
                <p>Thiết kế và tối ưu hóa enzyme cho các ứng dụng công nghiệp</p>
              </div>
              <div className="area-item">
                <h3>Synthetic Biology</h3>
                <p>Thiết kế và xây dựng các hệ thống sinh học nhân tạo</p>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Hợp tác nghiên cứu</h2>
            <p>
              Tôi luôn mở cửa cho các cơ hội hợp tác nghiên cứu với các trường đại học, 
              viện nghiên cứu và doanh nghiệp. Nếu bạn quan tâm đến việc hợp tác, 
              vui lòng <a href="/contact" className="inline-link">liên hệ</a> để thảo luận chi tiết.
            </p>
          </section>

          <section className="content-section">
            <h2>Thiết bị và Phương pháp</h2>
            <ul className="method-list">
              <li>Kỹ thuật PCR và Real-time PCR</li>
              <li>Protein purification và crystallography</li>
              <li>Next-generation sequencing (NGS)</li>
              <li>CRISPR-Cas9 gene editing</li>
              <li>Machine learning và AI analysis</li>
              <li>Microscopy và imaging techniques</li>
            </ul>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default ResearchPage;