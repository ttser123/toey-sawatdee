# 1. สร้าง Provider ตัวที่สองชี้ไป N. Virginia เพื่อดึง SSL โดยเฉพาะ
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# 2. ดึงใบ Certificate ของโดเมนมึงที่เคยสร้างไว้ในหน้า Console
data "aws_acm_certificate" "domain_cert" {
  provider    = aws.us_east_1
  domain      = "toey-sawatdee.me"
  most_recent = true
  statuses    = ["ISSUED"]
}

# 3. ดึง Managed Policies ของ CloudFront เพื่อความคลีน
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewerAndCloudFrontHeaders-2022-06"
}

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Toey Sawatdee Production CDN"
  aliases             = ["toey-sawatdee.me"] 

  origin {
    domain_name = aws_eip.app_eip.public_dns
    origin_id   = "toey-ec2-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" 
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "toey-ec2-origin"

    viewer_protocol_policy = "redirect-to-https" 

    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_optimized.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none" 
    }
  }

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.domain_cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}