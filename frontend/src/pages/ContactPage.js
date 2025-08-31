import React, { useState } from 'react';
import Layout from '../components/Layout';
import './PageStyles.css';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage('Cảm ơn bạn đã liên hệ! Tôi sẽ phản hồi trong vòng 24-48 giờ.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Layout activeNavItem="contact">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Liên hệ</h1>
          <p className="page-subtitle">Kết nối để thảo luận về nghiên cứu, hợp tác và các cơ hội học tập</p>
        </div>

        <div className="content-sections">
          <div className="contact-layout">
            <div className="contact-form-section">
              <h2>Gửi tin nhắn</h2>
              {submitMessage && (
                <div className="success-message">
                  {submitMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Họ và tên *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Chủ đề</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn chủ đề...</option>
                    <option value="research">Hợp tác nghiên cứu</option>
                    <option value="courses">Đăng ký khóa học</option>
                    <option value="consultation">Tư vấn khoa học</option>
                    <option value="collaboration">Cơ hội hợp tác</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Tin nhắn *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Vui lòng mô tả chi tiết nội dung bạn muốn thảo luận..."
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            </div>

            <div className="contact-info-section">
              <h2>Thông tin liên hệ</h2>
              
              <div className="contact-item">
                <h3>Email</h3>
                <p>
                  <a href="mailto:nguyenthanhtai@biotechlab.vn" className="contact-link">
                    nguyenthanhtai@biotechlab.vn
                  </a>
                </p>
                <p className="contact-note">Phản hồi trong vòng 24-48 giờ</p>
              </div>

              <div className="contact-item">
                <h3>Điện thoại</h3>
                <p>
                  <a href="tel:+84123456789" className="contact-link">
                    +84 123 456 789
                  </a>
                </p>
                <p className="contact-note">Thời gian làm việc: 9:00 - 17:00 (T2-T6)</p>
              </div>

              <div className="contact-item">
                <h3>Địa chỉ phòng lab</h3>
                <p>
                  Phòng Lab Công nghệ Sinh học<br />
                  Trường Đại học ABC<br />
                  123 Đường XYZ, Quận 1<br />
                  TP. Hồ Chí Minh, Việt Nam
                </p>
              </div>

              <div className="contact-item">
                <h3>Mạng xã hội khoa học</h3>
                <div className="social-links">
                  <a href="#" className="social-link">ResearchGate</a>
                  <a href="#" className="social-link">Google Scholar</a>
                  <a href="#" className="social-link">ORCID</a>
                  <a href="#" className="social-link">LinkedIn</a>
                </div>
              </div>

              <div className="office-hours">
                <h3>Giờ tư vấn</h3>
                <div className="schedule">
                  <p><strong>Thứ 2, 4, 6:</strong> 14:00 - 16:00</p>
                  <p><strong>Thứ 3, 5:</strong> 10:00 - 12:00</p>
                  <p><strong>Cuối tuần:</strong> Theo lịch hẹn</p>
                </div>
                <p className="schedule-note">
                  Vui lòng liên hệ trước để đặt lịch hẹn
                </p>
              </div>
            </div>
          </div>

          <section className="content-section">
            <h2>Các loại hợp tác</h2>
            <div className="collaboration-types">
              <div className="collab-item">
                <h3>Nghiên cứu học thuật</h3>
                <p>Hợp tác trong các dự án nghiên cứu, công bố khoa học và phát triển công nghệ mới</p>
              </div>
              <div className="collab-item">
                <h3>Tư vấn doanh nghiệp</h3>
                <p>Tư vấn ứng dụng công nghệ sinh học trong sản xuất và phát triển sản phẩm</p>
              </div>
              <div className="collab-item">
                <h3>Đào tạo và giảng dạy</h3>
                <p>Tổ chức khóa học, workshop và chương trình đào tạo chuyên sâu</p>
              </div>
              <div className="collab-item">
                <h3>Chuyển giao công nghệ</h3>
                <p>Hỗ trợ chuyển giao công nghệ từ phòng lab đến ứng dụng thương mại</p>
              </div>
            </div>
          </section>

          <section className="content-section">
            <h2>FAQ - Câu hỏi thường gặp</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h4>Làm thế nào để đăng ký tham gia nghiên cứu?</h4>
                <p>Vui lòng gửi CV và mô tả ngắn về kinh nghiệm nghiên cứu qua email. Tôi sẽ liên hệ lại để thảo luận chi tiết.</p>
              </div>
              <div className="faq-item">
                <h4>Có nhận sinh viên thực tập không?</h4>
                <p>Có, tôi thường xuyên nhận sinh viên năm cuối và nghiên cứu sinh thực tập. Thời gian tối thiểu là 3 tháng.</p>
              </div>
              <div className="faq-item">
                <h4>Khóa học có cấp chứng chỉ không?</h4>
                <p>Tất cả khóa học đều cấp chứng chỉ hoàn thành có giá trị, được công nhận bởi các tổ chức khoa học.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

export default ContactPage;