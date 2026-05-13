resource "aws_cognito_user_pool" "pool" {
  name = "toey_portfolio_users"
  
  auto_verified_attributes = ["email"]
  
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = false
  }

  tags = {
    Project = "toey-sawatdee.me"
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "toey_nextjs_app"
  user_pool_id = aws_cognito_user_pool.pool.id
  
  generate_secret = false 

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.client.id
}