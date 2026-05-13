data "aws_route53_zone" "main" {
  name         = "toey-sawatdee.me"
  private_zone = false
}

resource "aws_route53_record" "origin" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "origin.toey-sawatdee.me"
  type    = "A"
  ttl     = "60" 
  records = [aws_eip.app_eip.public_ip] 
}