import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card, Image } from 'semantic-ui-react'
import { ImageModel } from '../types/ImageModel'
import './UdagramImage.css';

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
      <Card className='UdagramImage' fluid color="red">
        <Card.Content>
          <Card.Header>{this.props.image.title}</Card.Header>
          <Card.Description>{this.props.image.timestamp}</Card.Description>
          <Link to={{ pathname: this.props.image.url }} target="_blank">
            {this.props.image.url && (
              <Image src={this.props.image.url} />
            )}
          </Link>
        </Card.Content>
      </Card>
    )
  }
}
