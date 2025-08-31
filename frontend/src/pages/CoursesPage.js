import React from 'react';
import Layout from '../components/Layout';
import './PageStyles.css';

function CoursesPage() {
  return (
    <Layout activeNavItem="courses">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Khóa học</h1>
          <p className="page-subtitle">Các khóa học chuyên sâu về Công nghệ Sinh học và Bioinformatics</p>
        </div>

        <div className="content-sections">
          <section className="content-section">
            <h2>Khóa học hiện tại</h2>
            
            <div className="course-item featured">
              <div className="course-badge">Đang mở đăng ký</div>
              <h3>AI trong Công nghệ Sinh học</h3>
              <p className="course-duration">Thời gian: 8 tuần | 32 giờ học</p>
              <p className="course-level">Trình độ: Trung cấp - Nâng cao</p>
              <p>
                Khóa học chuyên sâu về việc ứng dụng trí tuệ nhân tạo trong nghiên cứu sinh học. 
                Học viên sẽ được học cách sử dụng machine learning để phân tích dữ liệu sinh học, 
                dự đoán cấu trúc protein và tối ưu hóa quá trình nghiên cứu.
              </p>
              <div className="course-topics">
                <h4>Nội dung chính:</h4>
                <ul>
                  <li>Giới thiệu về AI trong sinh học</li>
                  <li>Machine Learning cơ bản</li>
                  <li>Deep Learning cho dữ liệu sinh học</li>
                  <li>Protein structure prediction</li>
                  <li>Drug discovery với AI</li>
                  <li>Thực hành dự án thực tế</li>
                </ul>
              </div>
              <div className="course-info">
                <p><strong>Học phí:</strong> 2.500.000 VNĐ</p>
                <p><strong>Bắt đầu:</strong> 15/04/2024</p>
                <p><strong>Hình thức:</strong> Online + Offline</p>
              </div>
            </div>

            <div className="course-item">
              <h3>Bioinformatics cơ bản</h3>
              <p className="course-duration">Thời gian: 6 tuần | 24 giờ học</p>
              <p className="course-level">Trình độ: Cơ bản</p>
              <p>
                Khóa học dành cho người mới bắt đầu với Bioinformatics. Học viên sẽ học các khái niệm cơ bản, 
                công cụ phân tích dữ liệu sinh học và thực hành với các dataset thực tế.
              </p>
              <div className="course-topics">
                <h4>Nội dung chính:</h4>
                <ul>
                  <li>Giới thiệu về Bioinformatics</li>
                  <li>Databases sinh học (GenBank, UniProt, PDB)</li>
                  <li>Sequence alignment và BLAST</li>
                  <li>Phylogenetic analysis</li>
                  <li>Structural bioinformatics</li>
                  <li>Thực hành với Python/R</li>
                </ul>
              </div>
              <div className="course-info">
                <p><strong>Học phí:</strong> 1.800.000 VNĐ</p>
                <p><strong>Bắt đầu:</strong> 01/05/2024</p>
                <p><strong>Hình thức:</strong> Online</p>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Khóa học sắp tới</h2>
            
            <div className="course-item upcoming">
              <div className="course-badge upcoming">Sắp mở</div>
              <h3>CRISPR và Gene Editing</h3>
              <p className="course-duration">Thời gian: 4 tuần | 16 giờ học</p>
              <p className="course-level">Trình độ: Nâng cao</p>
              <p>
                Khóa học chuyên sâu về công nghệ CRISPR-Cas9 và các phương pháp chỉnh sửa gene hiện đại. 
                Bao gồm lý thuyết, thiết kế thí nghiệm và ứng dụng thực tế.
              </p>
              <div className="course-info">
                <p><strong>Dự kiến mở:</strong> Tháng 6/2024</p>
                <p><strong>Hình thức:</strong> Offline tại phòng lab</p>
              </div>
            </div>

            <div className="course-item upcoming">
              <div className="course-badge upcoming">Sắp mở</div>
              <h3>Synthetic Biology Workshop</h3>
              <p className="course-duration">Thời gian: 3 ngày | Workshop chuyên sâu</p>
              <p className="course-level">Trình độ: Chuyên gia</p>
              <p>
                Workshop thực hành về sinh học tổng hợp, thiết kế hệ thống sinh học nhân tạo và 
                ứng dụng trong công nghiệp.
              </p>
              <div className="course-info">
                <p><strong>Dự kiến mở:</strong> Tháng 7/2024</p>
                <p><strong>Hình thức:</strong> Intensive workshop</p>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Khóa học đã hoàn thành</h2>
            <div className="completed-courses">
              <div className="completed-item">
                <h4>Protein Structure Analysis (Tháng 1-2/2024)</h4>
                <p>25 học viên hoàn thành - Đánh giá: 4.8/5</p>
              </div>
              <div className="completed-item">
                <h4>Introduction to Genomics (Tháng 11-12/2023)</h4>
                <p>35 học viên hoàn thành - Đánh giá: 4.9/5</p>
              </div>
              <div className="completed-item">
                <h4>Computational Biology Fundamentals (Tháng 9-10/2023)</h4>
                <p>28 học viên hoàn thành - Đánh giá: 4.7/5</p>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Hình thức học</h2>
            <div className="learning-formats">
              <div className="format-item">
                <h3>Online</h3>
                <p>Học qua video, live session và forum thảo luận</p>
                <ul>
                  <li>Linh hoạt thời gian</li>
                  <li>Tài liệu số đầy đủ</li>
                  <li>Hỗ trợ 24/7</li>
                </ul>
              </div>
              <div className="format-item">
                <h3>Offline</h3>
                <p>Học trực tiếp tại phòng lab với thiết bị chuyên nghiệp</p>
                <ul>
                  <li>Thực hành trực tiếp</li>
                  <li>Tương tác trực tiếp với giảng viên</li>
                  <li>Sử dụng thiết bị hiện đại</li>
                </ul>
              </div>
              <div className="format-item">
                <h3>Hybrid</h3>
                <p>Kết hợp online và offline để tối ưu hiệu quả học tập</p>
                <ul>
                  <li>Lý thuyết online</li>
                  <li>Thực hành offline</li>
                  <li>Linh hoạt và hiệu quả</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Đăng ký và Liên hệ</h2>
            <p>
              Để đăng ký khóa học hoặc tìm hiểu thêm thông tin chi tiết, vui lòng 
              <a href="/contact" className="inline-link"> liên hệ với chúng tôi</a>.
              Chúng tôi sẽ tư vấn khóa học phù hợp nhất với trình độ và mục tiêu của bạn.
            </p>
            
            <div className="registration-info">
              <h4>Thông tin đăng ký:</h4>
              <ul>
                <li>Ưu đãi 10% cho sinh viên và học sinh</li>
                <li>Giảm 15% khi đăng ký 2 khóa học trở lên</li>
                <li>Hỗ trợ trả góp cho các khóa học dài hạn</li>
                <li>Chứng chỉ hoàn thành có giá trị</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default CoursesPage;