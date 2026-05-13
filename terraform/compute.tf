data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

resource "aws_iam_role" "ssm_role" {
  name = "toey_ec2_ssm_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "toey_ec2_profile"
  role = aws_iam_role.ssm_role.name
}

resource "aws_launch_template" "nextjs_app" {
  name_prefix   = "toey-sawatdee-"
  image_id      = data.aws_ami.amazon_linux_2023.id 
  instance_type = "t3.micro"
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  user_data = filebase64("${path.module}/userdata.sh")

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "toey-sawatdee-prod"
    }
  }
}

resource "aws_instance" "app_server" {
  launch_template {
    id      = aws_launch_template.nextjs_app.id
    version = "$Latest"
  }
  
  subnet_id = aws_subnet.public.id
  disable_api_termination = false

  tags = {
    Name = "toey-sawatdee-prod"
  }
}

resource "aws_iam_role_policy" "ssm_parameter_read" {
  name = "toey_read_ghcr_token"
  role = aws_iam_role.ssm_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/toey-sawatdee/prod/ghcr-token"
      }
    ]
  })
}