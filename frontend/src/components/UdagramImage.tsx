import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card, Image } from 'semantic-ui-react'
import { ImageModel } from '../types/ImageModel'

interface ImageCardProps {
  image: ImageModel
}

interface ImageCardState {}

export class UdagramImage extends React.PureComponent<
  ImageCardProps,
  ImageCardState
> {

  render() {
    return (
      <Card fluid color="red">
        <Card.Content>
          <Card.Header>{this.props.image.title}</Card.Header>
          <Card.Description>{this.props.image.timestamp}</Card.Description>
          <Link to={this.props.image.url}>
            {this.props.image.url && (
              <Image src={this.props.image.url} />
            )}
          </Link>
        </Card.Content>
      </Card>
    )
  }
}
