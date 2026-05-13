resource "aws_iam_user" "deployer" {
  name = "deployer"
  tags = {
    Project = "toey-sawatdee.me"
  }
}

resource "aws_iam_access_key" "deployer_key" {
  user = aws_iam_user.deployer.name
}

resource "aws_iam_user_policy" "deployer_policy" {
  name = "deployer-policy"
  user = aws_iam_user.deployer.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudfront:ListDistributions",
          "cloudfront:CreateInvalidation"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:SendCommand"
        ]
        Resource = "*"
      }
    ]
  })
}

output "deployer_access_key" {
  value     = aws_iam_access_key.deployer_key.id
  sensitive = true
}

output "deployer_secret_key" {
  value     = aws_iam_access_key.deployer_key.secret
  sensitive = true
}