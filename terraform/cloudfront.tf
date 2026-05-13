provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

data "aws_acm_certificate" "domain_cert" {
  provider    = aws.us_east_1
  domain      = "toey-sawatdee.me"
  most_recent = true
  statuses    = ["ISSUED"]
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewerAndCloudFrontHeaders-2022-06"
}

resource "aws_cloudfront_cache_policy" "nextjs_cache" {
  name        = "Toey-NextJS-App-Router-Policy"
  comment     = "Prevent RSC payload cache poisoning"
  default_ttl = 0  
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = [
          "Accept", 
          "rsc", 
          "next-router-prefetch", 
          "next-router-state-tree"
        ]
      }
    }
    query_strings_config {
      query_string_behavior = "all"
    }
  }
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
    cache_policy_id          = aws_cloudfront_cache_policy.nextjs_cache.id
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