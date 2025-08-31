#!/usr/bin/env python3
"""
Generate sample biotechnology articles for the CMS blog
"""

import requests
import json
import random
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:5000"
ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "admin123"
}

# Sample biotechnology articles in Vietnamese
BIOTECHNOLOGY_ARTICLES = [
    {
        "title": "Công nghệ CRISPR-Cas9: Cuộc cách mạng trong chỉnh sửa gen",
        "content": """
        <h2>Giới thiệu về CRISPR-Cas9</h2>
        <p>CRISPR-Cas9 là một trong những công nghệ đột phá nhất trong lĩnh vực sinh học phân tử hiện đại. Công nghệ này cho phép các nhà khoa học chỉnh sửa DNA với độ chính xác cao, mở ra nhiều khả năng ứng dụng trong y học, nông nghiệp và nghiên cứu cơ bản.</p>
        
        <h3>Cơ chế hoạt động</h3>
        <p>CRISPR-Cas9 hoạt động như một "kéo cắt phân tử" có thể nhận diện và cắt các chuỗi DNA cụ thể. Hệ thống bao gồm hai thành phần chính:</p>
        <ul>
        <li><strong>Guide RNA (gRNA):</strong> Định hướng vị trí cắt trên DNA</li>
        <li><strong>Protein Cas9:</strong> Thực hiện việc cắt DNA tại vị trí được chỉ định</li>
        </ul>
        
        <h3>Ứng dụng trong y học</h3>
        <p>Công nghệ CRISPR đã mở ra nhiều hướng điều trị mới cho các bệnh di truyền như:</p>
        <ul>
        <li>Bệnh thalassemia</li>
        <li>Bệnh thiếu máu hình lưỡi liềm</li>
        <li>Các bệnh ung thư</li>
        <li>Các bệnh về mắt di truyền</li>
        </ul>
        
        <h3>Thách thức và tương lai</h3>
        <p>Mặc dù tiềm năng rất lớn, CRISPR vẫn đối mặt với nhiều thách thức về mặt đạo đức, an toàn và kỹ thuật. Việc nghiên cứu và phát triển công nghệ này đòi hỏi sự cân nhắc kỹ lưỡng về các tác động lâu dài.</p>
        """,
        "excerpt": "Khám phá công nghệ CRISPR-Cas9 - cuộc cách mạng trong chỉnh sửa gen với những ứng dụng đột phá trong y học và nghiên cứu sinh học.",
        "featured_image": "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=400&fit=crop",
        "meta_title": "CRISPR-Cas9: Công nghệ chỉnh sửa gen cách mạng",
        "meta_description": "Tìm hiểu về CRISPR-Cas9, công nghệ chỉnh sửa gen đột phá với ứng dụng trong điều trị bệnh di truyền và nghiên cứu y sinh học."
    },
    {
        "title": "Công nghệ sinh học trong nông nghiệp: Cây trồng biến đổi gen",
        "content": """
        <h2>Cây trồng biến đổi gen trong nông nghiệp hiện đại</h2>
        <p>Công nghệ sinh học đã mang lại những thay đổi căn bản trong nông nghiệp thông qua việc phát triển các giống cây trồng biến đổi gen (GMO). Những cây trồng này được thiết kế để có các đặc tính ưu việt như kháng sâu bệnh, chịu hạn, và giá trị dinh dưỡng cao hơn.</p>
        
        <h3>Các loại cây trồng GMO phổ biến</h3>
        <p>Hiện tại, một số cây trồng GMO được trồng rộng rãi trên thế giới bao gồm:</p>
        <ul>
        <li><strong>Đậu tương Roundup Ready:</strong> Kháng thuốc diệt cỏ glyphosate</li>
        <li><strong>Ngô Bt:</strong> Kháng sâu đục thân ngô</li>
        <li><strong>Bông GMO:</strong> Kháng sâu và thuốc diệt cỏ</li>
        <li><strong>Gạo vàng:</strong> Giàu vitamin A</li>
        </ul>
        
        <h3>Lợi ích của cây trồng GMO</h3>
        <p>Cây trồng biến đổi gen mang lại nhiều lợi ích:</p>
        <ul>
        <li>Tăng năng suất và chất lượng</li>
        <li>Giảm sử dụng thuốc bảo vệ thực vật</li>
        <li>Cải thiện giá trị dinh dưỡng</li>
        <li>Thích ứng với biến đổi khí hậu</li>
        </ul>
        
        <h3>Thảo luận về an toàn</h3>
        <p>Việc sử dụng cây trồng GMO vẫn là chủ đề được tranh luận sôi nổi. Các nghiên cứu khoa học đã chứng minh tính an toàn của hầu hết các sản phẩm GMO được phê duyệt, nhưng vẫn cần có các quy định và giám sát chặt chẽ.</p>
        """,
        "excerpt": "Tìm hiểu về cây trồng biến đổi gen và vai trò của công nghệ sinh học trong việc cải thiện năng suất và chất lượng nông sản.",
        "featured_image": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop",
        "meta_title": "Cây trồng biến đổi gen trong nông nghiệp hiện đại",
        "meta_description": "Khám phá vai trò của công nghệ sinh học trong phát triển cây trồng GMO, lợi ích và thách thức trong nông nghiệp bền vững."
    },
    {
        "title": "Liệu pháp tế bào gốc: Hy vọng mới trong điều trị bệnh tật",
        "content": """
        <h2>Tế bào gốc và tiềm năng điều trị</h2>
        <p>Tế bào gốc (stem cell) được coi là một trong những khám phá quan trọng nhất trong y học tái tạo. Với khả năng tự gia sinh và biệt hóa thành nhiều loại tế bào khác nhau, tế bào gốc mở ra những hy vọng mới trong điều trị các bệnh nan y.</p>
        
        <h3>Các loại tế bào gốc</h3>
        <p>Có hai loại tế bào gốc chính được sử dụng trong nghiên cứu và điều trị:</p>
        
        <h4>1. Tế bào gốc phôi thai (ESC)</h4>
        <ul>
        <li>Có khả năng biệt hóa thành mọi loại tế bào trong cơ thể</li>
        <li>Tiềm năng điều trị cao nhưng gây tranh cãi về mặt đạo đức</li>
        </ul>
        
        <h4>2. Tế bào gốc trưởng thành (ASC)</h4>
        <ul>
        <li>Được tìm thấy trong nhiều mô của cơ thể trưởng thành</li>
        <li>An toàn hơn và ít tranh cãi về mặt đạo đức</li>
        </ul>
        
        <h3>Ứng dụng lâm sàng</h3>
        <p>Liệu pháp tế bào gốc đã được ứng dụng thành công trong điều trị:</p>
        <ul>
        <li><strong>Bệnh lý tim mạch:</strong> Tái tạo cơ tim sau nhồi máu</li>
        <li><strong>Bệnh Parkinson:</strong> Thay thế tế bào thần kinh bị tổn thương</li>
        <li><strong>Bỏng nặng:</strong> Tái tạo da và mô mềm</li>
        <li><strong>Bệnh tiểu đường:</strong> Tái tạo tế bào beta tuyến tụy</li>
        </ul>
        
        <h3>Thách thức và triển vọng</h3>
        <p>Mặc dù có tiềm năng lớn, liệu pháp tế bào gốc vẫn đối mặt với nhiều thách thức như nguy cơ tạo khối u, phản ứng miễn dịch, và chi phí cao. Tuy nhiên, với sự phát triển không ngừng của công nghệ, tương lai của y học tái tạo rất đầy hứa hẹn.</p>
        """,
        "excerpt": "Khám phá tiềm năng to lớn của liệu pháp tế bào gốc trong y học tái tạo và những ứng dụng đột phá trong điều trị bệnh tật.",
        "featured_image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop",
        "meta_title": "Liệu pháp tế bào gốc: Y học tái tạo hiện đại",
        "meta_description": "Tìm hiểu về liệu pháp tế bào gốc, một công nghệ y học tái tạo đầy tiềm năng trong điều trị các bệnh nan y."
    },
    {
        "title": "Sinh học tổng hợp: Thiết kế sự sống theo ý muốn",
        "content": """
        <h2>Sinh học tổng hợp - Kỷ nguyên mới của khoa học sống</h2>
        <p>Sinh học tổng hợp (Synthetic Biology) là một lĩnh vực interdisciplinary kết hợp sinh học, kỹ thuật, và khoa học máy tính để thiết kế và xây dựng các bộ phận sinh học mới, thiết bị, và hệ thống, hoặc để thiết kế lại các hệ thống sinh học tự nhiên cho các mục đích hữu ích.</p>
        
        <h3>Nguyên tắc cơ bản</h3>
        <p>Sinh học tổng hợp dựa trên các nguyên tắc kỹ thuật:</p>
        <ul>
        <li><strong>Chuẩn hóa:</strong> Tạo ra các bộ phận sinh học tiêu chuẩn có thể trao đổi</li>
        <li><strong>Mô đun hóa:</strong> Thiết kế theo module để dễ dàng lắp ráp</li>
        <li><strong>Phân tách:</strong> Tách biệt thiết kế và chế tạo</li>
        <li><strong>Trừu tượng hóa:</strong> Đơn giản hóa độ phức tạp sinh học</li>
        </ul>
        
        <h3>Ứng dụng thực tế</h3>
        <p>Sinh học tổng hợp đã có nhiều ứng dụng thành công:</p>
        
        <h4>1. Sản xuất dược phẩm</h4>
        <ul>
        <li>Sản xuất insulin từ vi khuẩn biến đổi gen</li>
        <li>Tạo ra artemisinin chống sốt rét</li>
        <li>Phát triển vaccine tổng hợp</li>
        </ul>
        
        <h4>2. Năng lượng sinh học</h4>
        <ul>
        <li>Vi khuẩn sản xuất nhiên liệu sinh học</li>
        <li>Tảo biến đổi gen tạo hydrogen</li>
        <li>Pin sinh học từ vi sinh vật</li>
        </ul>
        
        <h4>3. Xử lý môi trường</h4>
        <ul>
        <li>Vi khuẩn phân hủy chất thải plastic</li>
        <li>Tảo hấp thụ CO2 và kim loại nặng</li>
        <li>Hệ thống sinh học cảnh báo ô nhiễm</li>
        </ul>
        
        <h3>Thách thức đạo đức và an toàn</h3>
        <p>Sinh học tổng hợp đặt ra nhiều câu hỏi về đạo đức và an toàn sinh học. Việc tạo ra sự sống nhân tạo cần được kiểm soát chặt chẽ để tránh các rủi ro không mong muốn cho môi trường và xã hội.</p>
        """,
        "excerpt": "Sinh học tổng hợp - lĩnh vực khoa học mới cho phép thiết kế và tạo ra các hệ thống sinh học nhân tạo với nhiều ứng dụng đột phá.",
        "featured_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
        "meta_title": "Sinh học tổng hợp: Thiết kế sự sống nhân tạo",
        "meta_description": "Khám phá sinh học tổng hợp, lĩnh vực khoa học cho phép thiết kế và tạo ra các hệ thống sinh học mới với ứng dụng trong y học, năng lượng và môi trường."
    },
    {
        "title": "Công nghệ giải mã gen và y học cá nhân hóa",
        "content": """
        <h2>Cuộc cách mạng giải mã gen</h2>
        <p>Công nghệ giải mã gen (DNA sequencing) đã trải qua một cuộc cách mạng trong hai thập kỷ qua. Từ dự án Human Genome Project tốn hàng tỷ đô la và mười năm thực hiện, ngày nay chúng ta có thể giải mã toàn bộ bộ gen con người chỉ với vài trăm đô la trong vòng vài ngày.</p>
        
        <h3>Công nghệ Next-Generation Sequencing (NGS)</h3>
        <p>NGS đã thay đổi hoàn toàn cách chúng ta tiếp cận việc nghiên cứu gen:</p>
        <ul>
        <li><strong>Tốc độ cao:</strong> Giải mã hàng triệu chuỗi DNA cùng lúc</li>
        <li><strong>Chi phí thấp:</strong> Giảm chi phí từ 3 tỷ đô la xuống còn vài trăm đô la</li>
        <li><strong>Độ chính xác cao:</strong> Tỷ lệ lỗi < 0.1%</li>
        <li><strong>Ứng dụng đa dạng:</strong> Từ nghiên cứu cơ bản đến lâm sàng</li>
        </ul>
        
        <h3>Y học cá nhân hóa</h3>
        <p>Dựa trên thông tin di truyền cá nhân, y học cá nhân hóa mang lại:</p>
        
        <h4>1. Chẩn đoán chính xác</h4>
        <ul>
        <li>Xác định nguy cơ mắc bệnh di truyền</li>
        <li>Chẩn đoán sớm ung thư thông qua biomarker</li>
        <li>Phân loại chính xác các bệnh phức tạp</li>
        </ul>
        
        <h4>2. Điều trị đích</h4>
        <ul>
        <li>Lựa chọn thuốc dựa trên profile gen</li>
        <li>Xác định liều dùng tối ưu cho từng bệnh nhân</li>
        <li>Tránh các phản ứng phụ không mong muốn</li>
        </ul>
        
        <h4>3. Y học dự phòng</h4>
        <ul>
        <li>Đánh giá nguy cơ bệnh tật trong tương lai</li>
        <li>Tư vấn lối sống phù hợp với đặc điểm di truyền</li>
        <li>Screening sớm các bệnh có thể điều trị</li>
        </ul>
        
        <h3>Ứng dụng trong điều trị ung thư</h3>
        <p>Một trong những ứng dụng thành công nhất của y học cá nhân hóa là trong điều trị ung thư:</p>
        <ul>
        <li><strong>Liquid biopsy:</strong> Phát hiện ung thư qua máu</li>
        <li><strong>Targeted therapy:</strong> Thuốc nhắm vào đột biến cụ thể</li>
        <li><strong>Immunotherapy:</strong> Liệu pháp miễn dịch cá nhân hóa</li>
        </ul>
        
        <h3>Thách thức và tương lai</h3>
        <p>Mặc dù có tiềm năng lớn, y học cá nhân hóa vẫn đối mặt với thách thức về bảo mật thông tin gen, chi phí, và khả năng tiếp cận của người dân. Tương lai sẽ chứng kiến sự phát triển mạnh mẽ hơn nữa của lĩnh vực này.</p>
        """,
        "excerpt": "Khám phá cuộc cách mạng giải mã gen và y học cá nhân hóa - xu hướng tương lai của chăm sóc sức khỏe dựa trên thông tin di truyền cá nhân.",
        "featured_image": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop",
        "meta_title": "Giải mã gen và y học cá nhân hóa",
        "meta_description": "Tìm hiểu về công nghệ giải mã gen và ứng dụng trong y học cá nhân hóa, mang lại điều trị chính xác và hiệu quả hơn."
    }
]

def get_auth_token():
    """Get authentication token"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=ADMIN_CREDENTIALS,
            timeout=10
        )
        if response.status_code == 200:
            return response.json().get('access_token')
        else:
            print(f"Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def create_article(token, article_data):
    """Create a single article"""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Add some randomness to publication date
    days_ago = random.randint(1, 30)
    pub_date = datetime.now() - timedelta(days=days_ago)
    
    post_data = {
        **article_data,
        'status': 'published',
        'post_type': 'post',
        'category_id': 1,  # Use default "Uncategorized" category
        'published_at': pub_date.isoformat(),
        'tags': ['công nghệ sinh học', 'khoa học', 'y học']
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/posts",
            json=post_data,
            headers=headers,
            timeout=15
        )
        
        if response.status_code == 201:
            post = response.json()
            print("Created article successfully")
            return post
        else:
            print(f"Failed to create article: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error creating article: {e}")
        return None

def main():
    print("Generating Biotechnology Sample Articles")
    print("=" * 50)
    
    # Get authentication token
    print("Authenticating...")
    token = get_auth_token()
    if not token:
        print("Authentication failed!")
        return
    
    print("Authentication successful!")
    print()
    
    # Create articles
    print("Creating sample articles...")
    created_articles = []
    
    for i, article in enumerate(BIOTECHNOLOGY_ARTICLES, 1):
        print(f"Creating article {i}/{len(BIOTECHNOLOGY_ARTICLES)}...")
        created_article = create_article(token, article)
        if created_article:
            created_articles.append(created_article)
    
    print()
    print("=" * 50)
    print(f"Successfully created {len(created_articles)} biotechnology articles!")
    print()
    print("Summary:")
    for article in created_articles:
        print(f"  • {article['title']}")
    
    print()
    print("🌐 Visit your blog at: http://localhost:5000")
    print("Admin panel at: http://localhost:5000/admin")
    print()
    print("Your blog now has professional biotechnology content! 🚀")

if __name__ == "__main__":
    main()