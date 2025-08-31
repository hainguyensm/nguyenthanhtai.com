import React from 'react';
import Layout from '../components/Layout';
import './PageStyles.css';

function AboutPage() {
  return (
    <Layout activeNavItem="about">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Giới thiệu</h1>
          <p className="page-subtitle">Tìm hiểu về Nguyen Thanh Tai và hành trình nghiên cứu Công nghệ Sinh học</p>
        </div>

        <div className="content-sections">
          <section className="content-section">
            <h2>Về tôi</h2>
            <p>
              Chào mừng bạn đến với blog cá nhân của tôi - nơi chia sẻ về những khám phá và nghiên cứu 
              trong lĩnh vực Công nghệ Sinh học. Tôi là một nhà nghiên cứu đam mê khoa học và công nghệ, 
              luôn tìm kiếm những ứng dụng mới để cải thiện cuộc sống con người.
            </p>
          </section>

          <section className="content-section">
            <h2>Lĩnh vực chuyên môn</h2>
            <div className="expertise-grid">
              <div className="expertise-item">
                <h3>Công nghệ Sinh học</h3>
                <p>Nghiên cứu và phát triển các ứng dụng sinh học hiện đại</p>
              </div>
              <div className="expertise-item">
                <h3>Nghiên cứu khoa học</h3>
                <p>Thực hiện các dự án nghiên cứu trong lĩnh vực sinh học phân tử</p>
              </div>
              <div className="expertise-item">
                <h3>Giảng dạy</h3>
                <p>Chia sẻ kiến thức và kinh nghiệm qua các khóa học chuyên sâu</p>
              </div>
              <div className="expertise-item">
                <h3>Tư vấn khoa học</h3>
                <p>Hỗ trợ các doanh nghiệp trong việc ứng dụng công nghệ sinh học</p>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>Sứ mệnh</h2>
            <p>
              Tôi tin rằng Công nghệ Sinh học có thể mang lại những thay đổi tích cực cho xã hội. 
              Thông qua việc chia sẻ kiến thức, nghiên cứu và phát triển các ứng dụng thực tế, 
              tôi hy vọng góp phần vào sự phát triển bền vững của ngành sinh học tại Việt Nam.
            </p>
          </section>

          <section className="content-section">
            <h2>Liên kết</h2>
            <p>
              Nếu bạn quan tâm đến các nghiên cứu của tôi hoặc muốn hợp tác, vui lòng 
              <a href="/contact" className="inline-link"> liên hệ </a>
              để thảo luận thêm về các cơ hội hợp tác và dự án nghiên cứu.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default AboutPage;